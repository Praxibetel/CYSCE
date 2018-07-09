if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", (e) => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var noteContent = $("form > textarea")[0],
            noteMirror = CodeMirror.fromTextArea(noteContent, {
                mode: "markdown"
            });

        noteMirror.on("change", function(mirror) {
            noteContent.value = mirror.getValue();
        });

        $(window).on("load", function() {
            noteMirror.refresh();
        });
    }
});
