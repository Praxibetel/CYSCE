$("title").text(`${$(".forum-message > .heading > h2").eq(0).text()} > ${$(".main-content > form > h1 > a:nth-child(2)").text()} > ChooseYourStory.com`);

if ($("a.button:contains('Non-threaded')").length) {
    $(".forum-message").each(function(e) {
        let t = 0;
        for (let s = $(this).nextAll(".forum-message"); t < s.length && $(this).attr("style") !== $(s).eq(t).attr("style"); t++);
        $(".forum-message").slice(e, e + ++t).wrapAll($("<div></div>", {
            "class": "forum-thread"
        }));
    });
}

if ($(".forum-message .heading .buttons").length) {
    $(".forum-message .heading").each(function(e) {
        $(this).find("h2").add($(this).find(".buttons")).wrapAll($("<div></div>", {
            class: "heading-dom"
        }));
        $(this).find(".buttons").after($("<div></div>", {
            class: "heading-spacer"
        }));
        $(this).find(".subH2, .text[id]").wrapAll($("<div></div>", {
            class: "heading-sub"
        }));
    });

    $(".forum-message .heading .buttons").eq(0).prepend(
        $("<a></a>", {
            href: "#collapse",
            class: "button collapse"
        }).click(function() {
            var e = $(this).parents().siblings(".forum-thread");
            if ($(this).hasClass("collapsed")) e.removeClass("collapsed").find(".collapse").attr("title", "Collapse").find("span").text("Collapse"),
                $(this).attr("title", "Collapse All").find("span").text("Collapse");
            else e.addClass("collapsed").find(".collapse").attr("title", "Expand").find("span").text("Expand"),
                $(this).attr("title", "Expand All").find("span").text("Expand");
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
            var e = $(this).parents(".forum-thread").first();
            e.toggleClass("collapsed");
            $(this).attr("title", e.hasClass("collapsed") ? "Expand" : "Collapse").find("span").text(e.hasClass("collapsed") ? "Expand" : "Collapse");
            return false;
        }).append($("<img>", {
            src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/delete.png"
        }), " ", $("<span></span>").text("Collapse")));

    $("a[name]").each(function() {
        $(this).parent().find(".heading .buttons").prepend($("<a></a>", {
            href: "#" + $(this).attr("name"),
            class: "button anchor"
        }).append($("<img>", {
            src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/link.png"
        }), " Permalink"));
    });

}

dynamicizeForumPosts(".body");

$(".forum-message .heading .buttons .button").attr("title", function(e) {
    return $(this).text().trim();
});
