CodeMirror.defineSimpleMode("onpage", {
    start: [{
        regex: /(%%)(?:|([A-Z][A-Z0-9]*)|(-?[0-9]+))(%)(!?=|<=?|>=?)(%)(?:|([A-Z][A-Z0-9]*)|(-?[0-9]+))(%)(.*?)(%%)/,
        token: ["keyword", "variable", "number", "keyword", "operator", "keyword", "variable", "number", "keyword", "string", "keyword"]
    }, {
        regex: /(%%)(|[A-Z][A-Z0-9]*)(%%)/,
        token: ["keyword", "variable", "keyword"]
    }]
});

CodeMirror.defineMode("cyshtml", function(config, parserConfig) {
    return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "htmlmixed"), CodeMirror.getMode(config, "onpage"));
});

var htmlContent = document.getElementById("Content"),
    htmlMirror = CodeMirror.fromTextArea(htmlContent, {
        autoCloseBrackets: true,
        autoCloseTags: {
            whenOpening: true,
            whenClosing: true,
            indentTags: ["applet", "blockquote", "body", "div", "dl", "fieldset", "form", "frameset", "head", "html", "layer", "legend", "object", "ol", "script", "select", "style", "table", "ul"]
        },
        extraKeys: {
            "Tab": function(cm) {
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
            }
        },
        lineNumbers: true,
        lineWrapping: true,
        mode: "cyshtml",
        theme: "bespin",
        workDelay: 800,
        workTime: 600
    });

htmlMirror.on("change", function(mirror) {
    htmlContent.value = mirror.getValue();
});

$(window).on("load", function() {
  htmlMirror.refresh();
});
