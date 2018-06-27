if (!$("script:contains('CKEDITOR.replace')").length) {
    var noteContent = $("form > textarea")[0],
        noteMirror = CodeMirror.fromTextArea(noteContent, {
            autoCloseBrackets: true,
            extraKeys: {
                "Tab": function(cm) {
                    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                    cm.replaceSelection(spaces);
                }
            },
            lineNumbers: true,
            lineWrapping: true,
            mode: "markdown",
            theme: "bespin",
            workDelay: 800,
            workTime: 600
        });

    noteMirror.on("change", function(mirror) {
        noteContent.value = mirror.getValue();
    });

    $(window).on("load", function() {
        noteMirror.refresh();
    });
}
