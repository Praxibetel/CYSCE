if ($("a.button:contains('Non-threaded')").length) {
    $(".forum-message").each(function(e) {
        for (var s = $(this).nextAll(".forum-message"), t = 0; t < s.length && $(this).attr("style") !== $(s).eq(t).attr("style"); t++);
        $(".forum-message").slice(e, e + ++t).wrapAll($("<div></div>", {
            "class": "forum-thread"
        }));
    });
}
