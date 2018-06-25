if (!$("script:contains('CKEDITOR.replace')").length) {
    var noteMirror = CodeMirror.fromTextArea($("form > textarea")[0], {
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

    $("form").submit(function() {
        $("form > textarea").eq(0).val(noteMirror.getValue());
    });

    $(window).on("load", function() {
        noteMirror.refresh();
    });
}
