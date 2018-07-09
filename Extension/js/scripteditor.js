chrome.storage.sync.get("preferenceCodeMirror", (e) => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var scriptMirror = CodeMirror.fromTextArea(document.getElementById("ScriptText"), {
            mode: "cysscript"
        });

        $("form").submit(function() {
            $("#ScriptText").val(scriptMirror.getValue());
        });

        $(window).on("load", function() {
            scriptMirror.refresh();
        });
    }
});
