var path = new URL(document.location).pathname.toLowerCase(),
    base = document.documentElement,
    selector;

switch (true) {
    case /^\/story\/viewer\//.test(path):
        selector = "span[style*='color'], font[color]";
        break;
    case /^\/story\//.test(path):
        selector = ".storygame-description *[style*='color'], .storygame-description font[color]";
        base = document.querySelector("#BodyContainer > .main-content");
        break;
    case /^\/forums\/[\w-]+\/message\/\d+/.test(path):
        selector = ".body *[style*='color'], .body font[color]";
        base = document.getElementsByClassName("forum-message")[0];
        break;
    case /^\/my\/messages\/.*/.test(path):
        selector = ".message-body *[style*='color'], .message-body font[color]";
        base = document.getElementsByClassName("message-body")[0];
        break;
    case /^\/member\//.test(path):
        selector = "#profile_Text *[style*='color'], #profile_Text font[color], #profile_Stories *[style*='color'], #profile_Stories font[color], #profile_Posts *[style*='color'], #profile_Posts font[color]"
        base = document.querySelector("#BodyContainer > .main-content");
        break;
    case /^\/help\/articles\/article\.aspx/.test(path):
        selector = "#maincontent > :last-child *[style*='color'], #maincontent > :last-child font[color]"
        base = document.querySelector("#BodyContainer > .main-content");
        break;
}

function sRGBtolinearRGB(rgb) {
    return rgb.map(u => {
        u /= 255;
        return u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4;
    });
}

function linearRGBtosRGB(rgb) {
    return rgb.map(u => {
        return Math.round(
            255 * (u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055)
        );
    });
}

function getRelativeLuminance(rgb) {
    rgb = sRGBtolinearRGB(rgb);
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(c1, c2) {
    let Y1 = getRelativeLuminance(c1),
        Y2 = getRelativeLuminance(c2);
    return (Y1 > Y2 ? (Y1 + .05) / (Y2 + .05) : (Y2 + .05) / (Y1 + .05));
}

function autoContrast(color, base, R) {
    let max,
        min,
        RGB = sRGBtolinearRGB(color),
        Y1 = getRelativeLuminance(color),
        Y2 = getRelativeLuminance(base),
        Y3, Y3a, Y3b;
    if (R <= (Y1 > Y2 ? (Y1 + .05) / (Y2 + .05) : (Y2 + .05) / (Y1 + .05))) return color;
    Y3a = Math.abs(R * (Y2 + .05) - .05);
    if (Y3a > 1) Y3a = 1;
    Y3b = (-.05 * (R - 1) + Y2) / R;
    if (Y3b < 0) Y3b = 0;
    Y3 = Math.abs(Y3a - Y2) >= Math.abs(Y3b - Y2) ? Y3a : Y3b;
    if (Y3 >= 1) return [255, 255, 255];
    if (Y3 <= 0) return [0, 0, 0];
    RGB = RGB.map(u => u + (Y3 - Y1));
    let tries = 12;
    while (tries > 0 && ((max = Math.max(...RGB)) > 1 || (min = Math.min(...RGB)) < 0)) {
        let i = RGB.indexOf(max > 1 ? max : min),
            ab = RGB.map((u, j) => u * [0.2126, 0.7152, 0.0722][j]).filter((u, j) => i !== j).reduce((a, b) => a + b),
            x = [0.2126, 0.7152, 0.0722][i],
            diff = (Y3 - (max > 1 ? x : 0) - ab) / (1 - x);
        RGB = RGB.map((u, j) => i === j ? (max > 1 ? 1 : 0) : u + diff);
        tries--;
    }
    return linearRGBtosRGB(RGB);
}

function fromCSS(css) {
    return css.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i).slice(1).map(u => parseInt(u));
}

function toCSS(rgba) {
    return `rgb${rgba.length > 3 ? "a" : ""}(${rgba.join(", ")})`;
}

if (selector) browser.storage.sync.get(["preferenceVisibility", "preferenceContrast"]).then((e, error) => {
    if (error || !e.preferenceVisibility || !+e.preferenceContrast) return;
    if (e.preferenceVisibility === "shift") {
        var bg = fromCSS(getComputedStyle(base).backgroundColor);

        for (let span of [...document.querySelectorAll(selector)]) {
            span.style.removeProperty("background-color");
            if (span.style.color || span.color) {
                var fg = fromCSS(getComputedStyle(span).color),
                    newColor = autoContrast(fg, bg, +e.preferenceContrast);
                span.style.removeProperty("background-color");
                span.style.color = toCSS(newColor);
            }
        }
    } else {
        for (let span of [...document.querySelectorAll(selector)]) {
            if (span.tagName === "FONT") {
                span.style.backgroundColor = "transparent";
                span.style.color = "inherit";
            } else {
                span.style.removeProperty("background-color");
                span.style.removeProperty("color");
            }
        }
    }
});
