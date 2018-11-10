if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get(["preferenceCodeMirror", "preferenceCodeMirrorNotepad"], (e) => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var noteContent = $("form > textarea")[0],
            noteMirror = CodeMirror.fromTextArea(noteContent, Object.assign({}, ["cyshtml", "htmlmixed", "markdown", "textile"].includes(e.preferenceCodeMirrorNotepad) ? CMHTML : {}, {
                mode: e.preferenceCodeMirrorNotepad || "markdown"
            }));

        noteMirror.on("change", function(mirror) {
            noteContent.value = mirror.getValue();
        });

        $(window).on("load", function() {
            noteMirror.refresh();
        });
    }
});
