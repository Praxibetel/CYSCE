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

$("input[name='LinkTitle']").after(function() {
    return $("<label></label>").text(` #${$(this).parent().find("input[name='LinkID']").val()}`);
});

$(`tr:first-child [type="image"][src$="/script.gif"]`).attr({
  alt: "Edit Page Script",
  title: "Edit Page Script"
});

$(`tr:first-child [type="image"][src$="/script_dim.gif"]`).attr({
  alt: "Add Page Script",
  title: "Add Page Script"
});

for (let title of Object.entries({
    delete: "Delete Link",
    go: "Open Link Destination",
    stop: "Edit Link Restrictions",
    stop_dim: "Add Link Restrictions",
    item: "Edit Item Drops",
    item_dim: "Add Item Drops",
    addsub: "Edit Variable Changes",
    addsub_dim: "Add Variable Changes",
    script: "Edit Link Script",
    script_dim: "Add Link Script",
})) $(`tr:not(:first-child) [type="image"][src$="/${title[0]}.gif"]`).attr({
    alt: title[1],
    title: title[1]
});

$("a[onclick*='editlink']:empty").text("[none]");
