if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", (e) => {
    if (!chrome.runtime.lastError && !(e.preferenceCodeMirror === false)) {
        var propertyMirror = CodeMirror.fromTextArea($("#MainContentPlaceHolder_StoryDescription_ctl00")[0], {
            autoCloseTags: {
                whenOpening: true,
                whenClosing: true,
                indentTags: ["applet", "blockquote", "body", "div", "dl", "fieldset", "form", "frameset", "head", "html", "layer", "legend", "object", "ol", "script", "select", "style", "table", "ul"]
            },
            mode: "htmlmixed"
        });

        $("form").submit(function() {
            $("#MainContentPlaceHolder_StoryDescription_ctl00").val(propertyMirror.getValue());
        });

        $(window).on("load", function() {
            propertyMirror.refresh();
        });
    }
});
