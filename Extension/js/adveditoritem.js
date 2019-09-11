if (!$("script:contains('CKEDITOR.replace')").length) browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) {
        CMReady.then(() => {
            var propertyContent = $("#Description")[0],
                propertyMirror = CodeMirror.fromTextArea(propertyContent, CMHTML);

            if (CMAutobreak) propertyMirror.setValue(CMUnPreLine(propertyMirror.getValue()));

            propertyMirror.on("change", function(mirror) {
                propertyContent.value = CMAutobreak ? CMPreLine(mirror.getValue()) : mirror.getValue();
            });

            $(window).on("load", function() {
                propertyMirror.refresh();
            });
        });
    }
});
