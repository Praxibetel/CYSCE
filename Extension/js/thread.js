if ($("a.button:contains('Non-threaded')").length) {
    $(".forum-message").each(function(e) {
        for (var s = $(this).nextAll(".forum-message"), t = 0; t < s.length && $(this).attr("style") !== $(s).eq(t).attr("style"); t++);
        $(".forum-message").slice(e, e + ++t).wrapAll($("<div></div>", {
            "class": "forum-thread"
        }));
    });
}

$(".forum-message .heading .buttons").eq(0).prepend(
    $("<a></a>", {
        href: "#collapse",
        class: "button collapse"
    }).click(function() {
        var e = $(this).parent().parent().parent().siblings().filter(".forum-thread");
        e.toggleClass("collapsed");
        return false;
    }).append($("<img>", {
        src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/delete.png"
    }), " ", $("<span></span>").text("Collapse"), " All"));
$(".forum-thread > .forum-thread .forum-message .heading .buttons").prepend(
    $("<a></a>", {
        href: "#collapse",
        class: "button collapse"
    }).click(function() {
        var e = $(this).parent().parent().parent().parent();
        e.toggleClass("collapsed");
        $(this).find("span").text(e.hasClass("collapsed") ? "Expand" : "Collapse");
        return false;
    }).append($("<img>", {
        src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/delete.png"
    }), " ", $("<span></span>").text("Collapse")));
$(".body, .body *").contents().filter(function() {
    return (this.nodeType == 3 && $.trim(this.nodeValue) && /@[\w-]+/.test(this.data))
}).each(function() {
    var div = $("<div></div>"),
        node = $(this);
    div.html(node.text().replace(/@([\w-]+)/g, "<a href='/Member/?Username=$1'>$&</a>"));
    node.before(div.contents()).remove();
});

$("a[name]").each(function() {
    $(this).parent().find(".heading .buttons").prepend($("<a></a>", {
        href: "#" + $(this).attr("name"),
        class: "button anchor"
    }).append($("<img>", {
        src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/link.png"
    }), " Anchor"));
});
