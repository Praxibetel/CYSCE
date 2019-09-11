(async () => {
    const ADMZip = require("adm-zip"),
          csso = require("csso"),
          fs = require("fs").promises,
          glob = require("glob"),
          path = require("path"),
          sass = require("node-sass"),
          UglifyJS = require("uglify-es");

    const defaults = {
        browser: "chrome",
        folder: "Extension",
        ignore: [
            "**/.*",
            "**/*.alpha",
            "**/*.beta",
            "**/*.sass",
            "**/Thumbs.db"
        ],
        minify: false,
        output: "build.zip",
        verbose: false
    };

    var args = process.argv.slice(2),
        i = 0,
        iter = 0,
        options = Object.assign({}, defaults),
        renderedSass = {},
        zip = new ADMZip();

    while (i < args.length) {
        switch (args[i++]) {
            case "-c":
            case "--chrome":
                options.browser = "chrome";
                break;
            case "-f":
            case "--ff":
            case "--firefox":
                options.browser = "firefox";
                break;
            case "-m":
            case "--minify":
                options.minify = true;
                break;
            case "-o":
            case "--out":
            case "--output":
            case "--outfile":
                options.output = args[i++] || defaults.output;
                break;
            case "-v":
            case "--verbose":
                options.verbose = true;
                break;
        }
    }

    console.log(`Building for \x1b[35m${options.browser === "firefox" ? "Firefox" : "Chrome"}\x1b[0m`);

    await new Promise((resolve) => glob(`${options.folder}/**/*.sass`, {
        ignore: "**/_*"
    }, async (error, matches) => {
        for (let file of matches) {
            let stylesheet = await fs.readFile(file, "utf-8");
            if (options.browser === "firefox") stylesheet = stylesheet.replace(/chrome-extension/g, "moz-extension");
            renderedSass[`${path.basename(file, ".sass")}.min.css`] = await new Promise((resolve, reject) => sass.render({
                data: stylesheet,
                importer: (url, prev, done) => {
                    (async () => {
                        let imported = "";
                        let timestamp = +new Date();
                        url = url.replace(/(\.sass)?$/, ".sass");
                        try {
                            imported = await fs.readFile(path.join(file, "..", url), "utf-8");
                        } catch (e) {
                            try {
                                imported = await fs.readFile(path.join(file, "..", `_${url}`), "utf-8");
                            } catch (e) {}
                        }
                        if (options.browser === "firefox") {
                            if (url === "cyslantia-base.sass") imported = imported + "\n@import firefix\n";
                            imported = imported.replace(/chrome-extension/g, "moz-extension");
                        }
                        let tempName = `temp${process.pid}-${iter++}.sass`
                        await fs.writeFile(tempName, imported, "utf-8");
                        done({
                            file: tempName
                        });
                    })();
                },
                indentedSyntax: true,
                includePaths: [path.join(file, "..")],
                outputStyle: options.minify ? "compressed" : "expanded"
            }, (error, result) => {
                if (error) return reject(error);
                if (options.verbose) console.log(`Successfully rendered \x1b[33m${file}\x1b[0m as \x1b[34m${file.replace(/sass$/, "min.css")}\x1b[0m`);
                resolve(result);
            }));

        }

        resolve();
    }));

    console.log("Finished processing Sass files");

    await new Promise(resolve => glob(`${options.folder}/**`, {
        ignore: options.ignore,
        mark: true
    }, async (error, matches) => {
        for (let file of matches) {
            if (file.endsWith("/")) continue;
            try {
                let ext = path.extname(file),
                    fname = path.basename(file);
                switch (true) {
                    case fname === "manifest.json" && options.browser === "firefox":
                        let manifest = JSON.parse(await fs.readFile(file));
                        if (manifest.background && manifest.background.scripts) manifest.background.scripts = manifest.background.scripts.filter(script => script !== "js/browser-polyfill.js");
                        if (manifest.content_scripts) manifest.content_scripts = manifest.content_scripts.map(arr => {
                            if (arr.js) arr.js = arr.js.filter(script => script !== "js/browser-polyfill.js");
                            return arr;
                        });
                        manifest.name = "CYSFFE";
                        manifest.description = "CYS Firefox Extension";
                        manifest.applications = {
                            "gecko": {
                                "id": "cysffe@bradin.pw",
                                "strict_min_version": "42.0",
                                "update_url": "https://www.bradin.pw/cyslantia/CYSFFE/update.json"
                            }
                        };
                        if (!manifest.browser_action) manifest.browser_action = {};
                        manifest.browser_action.default_icon = manifest.icons;
                        console.log(`Successfully managed \x1b[33m${file}\x1b[0m`);
                        await zip.addFile(path.relative(options.folder, file), JSON.stringify(manifest, null, "\t"));
                        break;
                    case ext === ".css" && fname in renderedSass:
                        await zip.addFile(path.relative(options.folder, file), renderedSass[fname].css);
                        break;
                    case ext === ".css":
                        let css = await fs.readFile(file, "utf-8");
                        if (options.browser === "firefox") css = css.replace(/chrome-extension/g, "moz-extension");
                        if (options.minify) {
                            css = csso.minify(css).css
                            if (options.verbose) console.log(`Successfully minified \x1b[33m${file}\x1b[0m`);
                        }
                        await zip.addFile(path.relative(options.folder, file), Buffer.from(css));
                        break;
                    case options.minify && ext === ".js":
                        let min = UglifyJS.minify(await fs.readFile(file, "utf-8"), {
                          mangle: false,
                          output: {
                            beautify: true
                          }
                        });
                        if (min.error) throw min.error;
                        if (options.verbose) console.log(`Successfully minified \x1b[33m${file}\x1b[0m`);
                        await zip.addFile(path.relative(options.folder, file), Buffer.from(min.code));
                        break;
                    default:
                        await zip.addFile(path.relative(options.folder, file), await fs.readFile(file));
                }
                if (options.verbose) console.log(`Added \x1b[34m${file}\x1b[0m to the ZIP archive`);
            } catch (error) {
                console.log(`Build failed at file \x1b[31m${file}\x1b[0m`);
                console.log(error);
                process.exit();
            }
        }

        zip.writeZip(options.output);

        resolve();
    }));

    console.log(`Successfully wrote \x1b[34m${options.output}\x1b[0m`);

    await new Promise(resolve => glob(`temp${process.pid}-*.*`, {}, async (error, matches) => {
        for (let temp of matches) {
            await fs.unlink(temp);
        }
        resolve();
    }));

    console.log("Deleted temp files");
})();

/*

// hic sunt dracones
// the unsexy kind

function combIterable(obj, func) {
  if (typeof func === "function" && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj = obj.slice(0).map(entry => func(entry));
      } else {
        obj = Object.assign({}, obj);
        for (entry in obj) entry = func(entry);
      }
  } return obj;
}

function combAndFilter(obj, filter) {
    if (typeof filter === "function" && Array.isArray(obj)) obj = obj.filter(filter).map(obj => combIterable(obj, entry => entry = combAndFilter(entry, filter)));
    else obj = combIterable(obj, entry => entry = combAndFilter(entry, filter));
    return obj;
}

*/
