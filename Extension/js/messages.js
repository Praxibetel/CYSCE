chrome.storage.sync.get("preferenceCodeMirror", e => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var htmlContent = document.querySelector(".message-body > textarea"),
            htmlMirror = CodeMirror.fromTextArea(htmlContent, {
                autoCloseTags: {
                    whenOpening: true,
                    whenClosing: true,
                    indentTags: ["applet", "blockquote", "body", "div", "dl", "fieldset", "form", "frameset", "head", "html", "layer", "legend", "object", "ol", "script", "select", "style", "table", "ul"]
                },
                mode: "htmlmixed"
            });

        htmlMirror.on("change", function(mirror) {
            htmlContent.value = mirror.getValue();
        });

        $(window).on("load", function() {
            htmlMirror.refresh();
        });
    }
});
