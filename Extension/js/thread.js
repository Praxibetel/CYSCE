if ($("a.button:contains('Non-threaded')").length) {
    $(".forum-message").each(function(e) {
        for (var s = $(this).nextAll(".forum-message"), t = 0; t < s.length && $(this).attr("style") !== $(s).eq(t).attr("style"); t++);
        $(".forum-message").slice(e, e + ++t).wrapAll($("<div></div>", {
            "class": "forum-thread"
        }));
    });
}

$(".forum-message .heading .buttons").eq(0).prepend(
    '<a href="#collapse" class="button collapse" onclick="return $(this).parent().parent().parent().siblings().filter(\'.forum-thread\').toggleClass(\'collapsed\'), !1"><img src="' + chrome.extension.getURL("themes/images/elusive/minus.svg") + '"><span>Collapse</span> All</a>'
);

$(".forum-thread > .forum-thread .forum-message .heading .buttons").prepend(
    '<a href="#collapse" class="button collapse" onclick="var e = $(this).parent().parent().parent().parent(); return e.toggleClass(\'collapsed\'), $(this).find(\'span\').text(e.hasClass(\'collapsed\') ? \'Expand\' : \'Collapse\'), !1"><img src="' + chrome.extension.getURL("themes/images/elusive/minus.svg") + '"><span>Collapse</span></a>'
);

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
        class: "button"
    }).append($("<img>", {
        src: chrome.extension.getURL("themes/images/elusive/link.svg")
    }), " Anchor"));
});
