AJAX.then((resolve, reject) => {
    if (reject || !resolve) return;

    var rows = $("table:first-of-type tr");

    rows.find("th:nth-child(3)").after($("<th></th>", {
        class: "inverse1",
        align: "center",
        scope: "col"
    }).css({
        color: "white"
    }).text("Rating"));
    rows.find("td:nth-child(3)").after($("<td></td>", {
        class: "dark1borderTop1pxSolid",
        align: "center"
    }).css({
        whiteSpace: "nowrap"
    }).append($("<span></span>", {
        class: "smallerText"
    }).text("--")));
    rows.each(function() {
        var t = $(this);
        if (t.find("td:nth-child(3)").text().trim() !== "--") {
            $.get(href(t.find("td:first-child a").attr("href")), function(data) {
                if (data) {
                    data = $(data);
                    t.find("td:nth-child(4) span").text(data.find(".storygame-sidebar .rating").eq(0).text().trim().slice(0, -2))
                }
            })
        }
    });
})
