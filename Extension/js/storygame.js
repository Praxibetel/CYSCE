if (/^a\s*e/i.test($(".subH1").text().trim())) $(".subH1").html($(".subH1").html().replace("a", "an"));

$("h1").before($("<a></a>", {
    href: "#favorite",
    class: "button favorite"
}).css("float", "right").click(function() {
    if ($(this).hasClass("favorite")) {
        $(this).removeClass("favorite").addClass("unfavorite").attr("href", "#unfavorite")
            .find("span").text("Remove from").end()
            .find("img").attr("src", "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/book_delete.png");
    } else {
        $(this).removeClass("unfavorite").addClass("favorite").attr("href", "#favorite")
            .find("span").text("Add to").end()
            .find("img").attr("src", "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/book_add.png");
    }
    return false;
}).append($("<img>", {
    src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/book_add.png"
}), " ", $("<span></span>").text("Add to"), " Favorites"));
