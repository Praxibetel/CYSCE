$("#profile_Stories > div > span").each(function() {
    var e = $(this);
    e.wrap($("<a></a>", {
        href: `../story/${encodeURIComponent(e.text()).replace(/[-_.~"]/g, (c) => `%${c.charCodeAt(0).toString(16)}`).replace(/%/g, "~").toLowerCase()}`
    }));
}).addClass("unpublished");

$("#profile_Posts > div, #profile_Posts > div *").contents().filter(function() {
    return (this.nodeType == 3 && $.trim(this.nodeValue) && /@[\w-]+/.test(this.data))
}).each(function() {
    var div = $("<div></div>"),
        node = $(this);
    div.html(node.text().replace(/@([\w-]+)/g, "<a href='/Member/?Username=$1'>$&</a>"));
    node.before(div.contents()).remove();
});
