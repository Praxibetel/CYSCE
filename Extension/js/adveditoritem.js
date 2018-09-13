if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", e => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var propertyMirror = CodeMirror.fromTextArea($("#Description")[0], CMHTML);

        if (CMAutobreak) propertyMirror.setValue(CMUnPreLine(propertyMirror.getValue()));

        $("form").submit(function() {
            $("#Description").val(CMAutobreak ? CMPreLine(propertyMirror.getValue()) : propertyMirror.getValue());
        });

        $(window).on("load", function() {
            propertyMirror.refresh();
        });
    }
});
