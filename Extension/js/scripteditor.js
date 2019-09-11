browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) CMReady.then(() => {
        var scriptMirror = CodeMirror.fromTextArea(document.getElementById("ScriptText"), CMCYSScript);

        $("form").submit(function() {
            $("#ScriptText").val(scriptMirror.getValue());
        });

        $(window).on("load", function() {
            scriptMirror.refresh();
        });
    });
});
