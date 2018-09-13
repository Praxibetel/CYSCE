chrome.storage.sync.get("preferenceCodeMirror", e => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
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

$(".message-body, .message-body *").contents().filter(function() {
    return (this.nodeType == 3 && $.trim(this.nodeValue) && /@[\w-]+/.test(this.data))
}).each(function() {
    var div = $("<div></div>"),
        node = $(this);
    div.html(node.text().replace(/@([\w-]+)/g, "<a href='/Member/?Username=$1'>$&</a>"));
    node.before(div.contents()).remove();
});
$(".message-body, .message-body *").contents().filter(function() {
    return (this.nodeType == 3 && this.parentNode.nodeName !== "A" && $.trim(this.nodeValue) && /\b(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/i.test(this.data))
}).each(function() {
    var div = $("<div></div>"),
        node = $(this);
    div.html(node.text().replace(/\b(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/gi, "<a href='$&'>$&</a>"));
    node.before(div.contents()).remove();
});
