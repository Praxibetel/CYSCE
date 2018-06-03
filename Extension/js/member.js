$("#profile_Stories > div > span").each(function() {
    $(this).html('<a href="../story/' + encodeURIComponent($(this).text()).replace(/[-_.~"]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        }).replace(/%/g, '~').toLowerCase() + '">' +
        $(this).html() +
        '</a>'
    );
}).addClass("unpublished");

$("#profile_Posts > div, #profile_Posts > div *").contents().filter(function() {
    return (this.nodeType == 3 && $.trim(this.nodeValue) && /@[\w-]+/.test(this.data))
}).each(function() {
    var div = $("<div></div>"),
        node = $(this);
    div.html(node.text().replace(/@([\w-]+)/g, "<a href='/Member/?Username=$1'>$&</a>"));
    node.before(div.contents()).remove();
});
