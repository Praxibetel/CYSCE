if (!$("script:contains('CKEDITOR.replace')").length) {
    var htmlContent = document.querySelector(".contents > textarea"),
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
            mode: "htmlmixed",
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
}
