if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", e => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var htmlContent = document.querySelector(".contents > textarea"),
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

$(".forum-message .heading").each(function(e) {
    $(this).find("h2, .subH2").wrapAll($("<div></div>", {
        class: "heading-text"
    }));
});
