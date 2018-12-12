if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", e => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var propertyContent = $("#Description")[0],
            propertyMirror = CodeMirror.fromTextArea(propertyContent, CMHTML);

        if (CMAutobreak) propertyMirror.setValue(CMUnPreLine(propertyMirror.getValue()));

        propertyMirror.on("change", function(mirror) {
            propertyContent.value = CMAutobreak ? CMPreLine(mirror.getValue()) : mirror.getValue();
        });

        $(window).on("load", function() {
            propertyMirror.refresh();
        });
    }
});
