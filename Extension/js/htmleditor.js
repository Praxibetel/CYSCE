if (!$("script:contains('CKEDITOR.replace')").length) browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) CMReady.then(() => {
        var htmlContent = document.querySelector("form > div > textarea"),
            htmlMirror = CodeMirror.fromTextArea(htmlContent, Object.assign({}, CMHTML, {
                mode: "cyshtml"
            }));

        htmlMirror.on("change", function(mirror) {
            htmlContent.value = mirror.getValue();
        });

        $(window).on("load", function() {
            htmlMirror.refresh();
        });
    });
});

$("input[name='Title']").parent().children().wrapAll($("<span></span>", {
    class: "storygamePageEditorTitle"
}));

$("textarea#Content").parent().addClass(`CodeMirror-wrapper cm-s-${CodeMirror.defaults.theme}`);
