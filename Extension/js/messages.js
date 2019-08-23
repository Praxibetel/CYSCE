browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) {
        var htmlContent = document.querySelector(".message-body > textarea"),
            htmlMirror = CodeMirror.fromTextArea(htmlContent, CMHTML);

        if (CMAutobreak) htmlMirror.setValue(CMUnPreLine(htmlMirror.getValue()));

        htmlMirror.on("change", function(mirror) {
            htmlContent.value = CMAutobreak ? CMPreLine(mirror.getValue()) : mirror.getValue();
        });

        $(window).on("load", function() {
            htmlMirror.refresh();
        });
    }
});

dynamicizeForumPosts(".message-body");
