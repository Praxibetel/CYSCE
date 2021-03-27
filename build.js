(async () => {
    const csso = require("csso"),
          fs = require("fs").promises,
          glob = require("glob"),
          htmlMinify = require("html-minifier").minify,
          JSZip = require("jszip"),
          path = require("path"),
          sass = require("node-sass"),
          UglifyJS = require("uglify-js");

    const defaults = {
          browser: "chrome",
          folder: "Extension",
          ignore: [
              "**/.*",
              "**/*.alpha",
              "**/*.beta",
              "**/*.sass",
              "**/Thumbs.db",
              "**/codemirror/**/*.html",
              "**/codemirror/**/*test.js"
          ],
          minify: false,
          output: "build.zip",
          verbose: 1
    };

    var arg,
        args = process.argv.slice(2),
        i = 0,
        iter = 0,
        options = Object.assign({}, defaults),
        renderedSass = {},
        zip = new JSZip(),
        zipBuffer;

    while (i < args.length) {
        switch (arg = (args[i++] || "").toLowerCase()) {
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
                switch (arg = (args[i++] || "").toLowerCase(), true) {
                    case /\b(css|html|js)\b/.test(arg):
                        if (typeof options.minify !== "object") options.minify = {};
                        for (let subarg of arg.split(/\W+/)) options.minify[subarg] = true;
                        break;
                    default:
                        options.minify = true;
                        --i;
                        break;
                }
                break;
            case "-o":
            case "--out":
            case "--output":
            case "--outfile":
                options.output = args[i++] || defaults.output;
                break;
            case "-v":
            case "--verbose":
                switch (arg = (args[i++] || "").toLowerCase()) {
                    case "0":
                    case "none":
                        options.verbose = 0;
                        break;
                    case "1":
                    case "some":
                    case "modified":
                        options.verbose = 1;
                        break;
                    case "2":
                    case "all":
                    case "verbose":
                        options.verbose = 2;
                        break;
                    default:
                        options.verbose = 2;
                        --i;
                        break;
                }
                break;
        }
    }

    console.log(`Building for \x1b[35m${options.browser === "firefox" ? "Firefox" : "Chrome"}\x1b[0m`);

    await new Promise((resolve) => glob(`${options.folder}/**/*.sass`, {
        ignore: "**/_*"
    }, async (error, matches) => {
        for (let file of matches) {
            let stylesheet = await fs.readFile(file, "utf8");
            if (options.browser === "firefox") stylesheet = stylesheet.replace(/chrome-extension/g, "moz-extension");
            renderedSass[`${path.basename(file, ".sass")}.min.css`] = await new Promise((resolve, reject) => sass.render({
                data: stylesheet,
                importer: (url, prev, done) => {
                    (async () => {
                        let imported = "";
                        let timestamp = +new Date();
                        url = url.replace(/(\.sass)?$/, ".sass");
                        try {
                            imported = await fs.readFile(path.join(file, "..", url), "utf8");
                        } catch (e) {
                            try {
                                imported = await fs.readFile(path.join(file, "..", `_${url}`), "utf8");
                            } catch (e) {}
                        }
                        if (options.browser === "firefox") {
                            if (url === "cyslantia-base.sass") imported = imported + "\n@import firefix\n";
                            imported = imported.replace(/chrome-extension/g, "moz-extension");
                        }
                        let tempName = `temp${process.pid}-${iter++}.sass`
                        await fs.writeFile(tempName, imported, "utf8");
                        done({
                            file: tempName
                        });
                    })();
                },
                indentedSyntax: true,
                includePaths: [path.join(file, "..")],
                outputStyle: options.minify === true || options.minify.css ? "compressed" : "expanded"
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
                                "strict_min_version": "53.0"
                            }
                        };
                        if (!manifest.browser_action) manifest.browser_action = {};
                        manifest.browser_action.default_icon = manifest.icons;
                        console.log(`Successfully managed \x1b[33m${file}\x1b[0m`);
                        zip.file(path.relative(options.folder, file), JSON.stringify(manifest, null, "\t"));
                        break;
                    case ext === ".css" && fname in renderedSass:
                        zip.file(path.relative(options.folder, file), renderedSass[fname].css);
                        break;
                    case ext === ".css":
                        let css = await fs.readFile(file, "utf8");
                        if (options.browser === "firefox") css = css.replace(/chrome-extension/g, "moz-extension");
                        if (options.minify === true || options.minify.css) {
                            css = csso.minify(css).css
                            if (options.verbose) console.log(`Successfully minified \x1b[33m${file}\x1b[0m`);
                        }
                        await zip.file(path.relative(options.folder, file), Buffer.from(css));
                        break;
                    case ext === ".html" && (options.minify === true || options.minify.html):
                        let htmin = htmlMinify(await fs.readFile(file, "utf8"), {
                            collapseBooleanAttributes: true,
                            collapseWhitespace: true,
                            minifyCSS: options.minify === true || options.minify.css,
                            minifyJS: options.minify === true || options.minify.js,
                            removeComments: true,
                            removeRedundantAttributes: true,
                            removeScriptTypeAttributes: true,
                            removeStyleLinkTypeAttributes: true
                        });
                        if (options.verbose) console.log(`Successfully minified \x1b[33m${file}\x1b[0m`);
                        await zip.file(path.relative(options.folder, file), Buffer.from(htmin));
                        break;
                    case ext === ".js" && (options.minify === true || options.minify.js):
                        let jsmin = UglifyJS.minify(await fs.readFile(file, "utf8"), {
                            mangle: false,
                            output: {
                                beautify: true
                            }
                        });
                        if (jsmin.error) throw jsmin.error;
                        if (options.verbose) console.log(`Successfully minified \x1b[33m${file}\x1b[0m`);
                        await zip.file(path.relative(options.folder, file), Buffer.from(jsmin.code));
                        break;
                    default:
                        await zip.file(path.relative(options.folder, file), await fs.readFile(file));
                }
                if (options.verbose > 1) console.log(`Added \x1b[34m${file}\x1b[0m to the ZIP archive`);
            } catch (error) {
                console.log(`Build failed at file \x1b[31m${file}\x1b[0m`);
                console.log(error);
                process.exit();
            }
        }

        zipBuffer = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        try {
            await fs.writeFile(options.output, zipBuffer);
            console.log(`Successfully wrote \x1b[34m${options.output}\x1b[0m`);
        } catch (e) {
            console.log(`Couldn't write \x1b[31m${options.output}\x1b[0m`);
            console.log(e);
        }

        resolve();
    }));


    await new Promise(resolve => glob(`temp${process.pid}-*.*`, {}, async (error, matches) => {
        for (let temp of matches) {
            await fs.unlink(temp);
        }

        resolve();
    }));

    console.log("Deleted temp files");
})();
