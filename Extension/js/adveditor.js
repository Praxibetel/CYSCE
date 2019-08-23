if (!$("script:contains('CKEDITOR.replace')").length) browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) {
        var propertyMirror = CodeMirror.fromTextArea($("#MainContentPlaceHolder_StoryDescription_ctl00")[0], CMHTML);

        if (CMAutobreak) propertyMirror.setValue(CMUnPreLine(propertyMirror.getValue()));

        $("form").submit(function() {
            $("#MainContentPlaceHolder_StoryDescription_ctl00").val(CMAutobreak ? CMPreLine(propertyMirror.getValue()) : propertyMirror.getValue());
        });

        $(window).on("load", function() {
            propertyMirror.refresh();
        });
    }
});
