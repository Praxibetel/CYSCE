$("title").text(`${$(".forum-message > .heading > h2").eq(0).text()} > ${$(".main-content > form > h1 > a:nth-child(2)").text()} > ChooseYourStory.com`);

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
        if ($(this).hasClass("collapsed")) e.removeClass("collapsed").find("span").text("Collapse"),
            $(this).find("span").text("Collapse");
        else e.addClass("collapsed").find("span").text("Expand"),
            $(this).find("span").text("Expand");
        $(this).toggleClass("collapsed");
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

dynamicizeForumPosts(".body");

$("a[name]").each(function() {
    $(this).parent().find(".heading .buttons").prepend($("<a></a>", {
        href: "#" + $(this).attr("name"),
        class: "button anchor"
    }).append($("<img>", {
        src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/link.png"
    }), " Anchor"));
});
