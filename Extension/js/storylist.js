storyListData = [];
storyListDataFiltered = [];
storyListFiltersDefault = {
    inclEvery: true,
    inclFeatured: [true, true],
    inclRated: [true, true],
    inclTags: [],
    maxRating: 8,
    minRating: 3
};
storyListPageCount = 0;
storyListPageIndex = 0;
storyListPaginationDefault = {
    order: 1,
    pageSize: 18,
    sort: "rating"
};
storyListTags = [];

function storyListFilter(filters) {
    filters = {
        inclEvery: $("#filterTagAny").prop("checked") ? false : true,
        inclFeatured: $("#filterFeatureFeatured").prop("checked") ? [true, false] : $("#filterFeatureUnfeatured").prop("checked") ? [false, true] : [true, true],
        inclRated: $("#filterRatedRated").prop("checked") ? [true, false] : $("#filterRatedUnrated").prop("checked") ? [false, true] : [true, true],
        inclTags: $("#filterTagContainer label").map(function() {
            if ($(this).find("input").prop("checked")) return $(this).text().trim();
        }).get(),
        maxRating: parseInt($("#filterRatingMax").val()) || storyListFiltersDefault.maxRating,
        minRating: parseInt($("#filterRatingMin").val()) || storyListFiltersDefault.minRating,
        maxDate: new Date($("#filterDateMax").val()),
        minDate: new Date($("#filterDateMin").val())
    };
    filters = Object.assign(storyListFiltersDefault, filters);
    return storyListData.filter(a => {
        var pubdate = new Date(a.published);
        return (
            Math.round(a.rating) >= filters.minRating &&
            Math.round(a.rating) <= filters.maxRating &&
            (filters.inclEvery ?
                filters.inclTags.every(t => a.tags.includes(t)) :
                filters.inclTags.some(t => a.tags.includes(t))
            ) &&
            ((a.myrating && filters.inclRated[0]) || !a.myrating && filters.inclRated[1]) &&
            ((a.featured && filters.inclFeatured[0]) || !a.featured && filters.inclFeatured[1]) &&
            (!isNaN(filters.minDate.valueOf()) ?
                (!isNaN(filters.maxDate.valueOf()) ?
                    (filters.minDate <= pubdate && pubdate <= filters.maxDate) :
                    filters.minDate <= pubdate
                ) : !isNaN(filters.maxDate.valueOf()) ? pubdate <= filters.maxDate : true
            )
        );
    });
}

function storyListPaginate(data = []) {
    pagination = {
        order: $("#paginationSort")
            .val()
            .split("-")[1] === "asc" ?
            1 :
            -1,
        pageSize: parseInt($("#paginationPageSize").val()) ||
            storyListPaginationDefault.pageSize,
        sort: $("#paginationSort")
            .val()
            .split("-")[0]
    };
    pagination = Object.assign(storyListPaginationDefault, pagination);

    if ($("#paginationSearch").val()) data = data.filter(a => {
        var test = $("#paginationSearch").val().toLowerCase();
        return (
            a.title.toLowerCase().includes(test) ||
            a.username.toLowerCase().includes(test)
        );
    });

    data.sort((a, b) => {
        var sortA = a.rating,
            sortB = b.rating;
        (sortC = a.title.replace(/^(the|an?)\W+|[^A-Z0-9]+/gi, "").toUpperCase()),
        (sortD = b.title.replace(/^(the|an?)\W+|[^A-Z0-9]+/gi, "").toUpperCase());
        switch (pagination.sort) {
            case "alpha":
                (sortA = sortC), (sortB = sortD);
                break;
            case "length":
                (sortA = a.length), (sortB = b.length);
                break;
            case "published":
                (sortA = new Date(a.published)), (sortB = new Date(b.published));
                break;
            case "ratings":
                (sortA = a.ratings), (sortB = b.ratings);
                break;
        }
        return (
            (sortA > sortB ? 1 : sortA < sortB ? -1 : 0) * pagination.order ||
            (sortC > sortD ? 1 : sortC < sortD ? -1 : 0)
        );
    });

    storyListPageCount = Math.ceil(data.length / pagination.pageSize);
    if (storyListPageIndex >= storyListPageCount) storyListPageIndex = (storyListPageCount || 1) - 1;

    var pageStart = (storyListPageIndex * pagination.pageSize + 1),
        pageEnd = ((storyListPageIndex + 1) * pagination.pageSize);

    $("#paginationNumeration").attr("title", (data.length > 0 ? pageStart : 0) + "–" + (pageEnd < data.length ? pageEnd : data.length) + " of " + data.length);
    $("#paginationNumerator").text(storyListPageIndex + 1);
    $("#paginationDenominator").text(storyListPageCount || 1);

    return data.slice(
        storyListPageIndex * pagination.pageSize,
        (storyListPageIndex + 1) * pagination.pageSize
    );
}

function storyListApply(data = []) {
    $("#storygameList").empty();
    data.forEach(e => {
        $("#storygameList").append(
            $("<div></div>", {
                class: "entry"
            }).append(
                $("<div></div>", {
                    class: "fullwidth"
                }).append(
                    $("<h2></h2>")
                    .append(
                        $("<a></a>", {
                            href: e.url
                        }).text(e.title)
                    )
                    .css("display", "inline-block"),
                    " by ",
                    $("<div></div>")
                    .append(
                        $("<a></a>", {
                            href: "/Member/?Username=" + e.username
                        }).text(e.username)
                    )
                    .css("display", "inline-block")
                ),
                $("<div></div>", {
                    class: "flex"
                }).append(
                    $("<a></a>", {
                        href: e.url + "/comments",
                        title: e.rating || 0
                    }).append(
                        $("<div></div>", {
                            class: "flex ratingContainer"
                        }).append(
                            $("<div></div>", {
                                class: "rating" + (e.myrating ? " rated" : "")
                            }).css("width", 100 * ((e.myrating || e.rating || 0) / 8) + "%")
                        )
                    ),
                    e.desc ?
                    $("<div></div>", {
                        class: "flex"
                    }).text(e.desc) :
                    $("<div></div>", {
                        class: "flex"
                    }).html("&nbsp;"),
                    $("<div></div>", {
                        class: "flex"
                    }).append(
                        e.featured ? $("<span></span>", {
                            class: "tag featured"
                        }).text(" Featured") : "",
                        e.tags.map(t => {
                            return $("<span></span>", {
                                class: "tag"
                            }).append(
                                t
                            );
                        }) ||
                        $("<span></span>", {
                            class: "tag"
                        }).text("(none)")
                    )
                ),
                $("<div></div>", {
                    class: "flex"
                }).append(
                    $("<div></div>", {
                        class: "flex"
                    }).append(
                        $("<strong></strong>").text(e.ratings || "0"),
                        " rating" + (e.ratings === 1 ? "" : "s")
                    ),
                    $("<div></div>", {
                        class: "flex"
                    }).append(
                        $("<strong></strong>").text((e.length || "?") + "/8"),
                        " length"
                    ),
                    $("<div></div>", {
                        class: "flex"
                    }).text(moment(e.published).format("LL") || "")
                )
            )
        );
    });
}

function storyListProcess(nofilter) {
    if (!nofilter) storyListDataFiltered = storyListFilter();
    var storyListPage = storyListDataFiltered;
    storyListPage = storyListPaginate(storyListPage);
    storyListApply(storyListPage);
}

$("body").on("click", "h2[data-for]", function() {
    var e = $("#" + this.dataset.for);
    if ($(this).hasClass("collapsed")) e.show();
    else e.hide();
    $(this).toggleClass("collapsed");
});

$("body").on("submit", "#storygameListFilters", function() {
    storyListProcess();
    return false;
});

$("body").on("click", "#storygameListFilters #filterApply", function() {
    storyListProcess();
});

$("body").on("change", "#filterTagContainer input[type='checkbox']", function() {
    $("[data-for='filterTagContainer']").attr("data-value", $("#filterTagContainer input:checked").length);
    $("#filterTagArray").val($("#filterTagContainer input:checked").map(function() {
        return $(this).parent().text().trim();
    }).get().join(","));
});

$("body").on("change", "#storygameListFilters #filterRatingMin", function() {
    if ($(this).val() > $("#filterRatingMax").val())
        $("#filterRatingMax").val($(this).val());
});

$("body").on("change", "#storygameListFilters #filterRatingMax", function() {
    if ($(this).val() < $("#filterRatingMin").val())
        $("#filterRatingMin").val($(this).val());
});

$("body").on("change", "#storygameListFilters #filterDateMin", function() {
    if (new Date($(this).val()) > new Date($("#filterDateMax").val()))
        $("#filterDateMax").val($(this).val());
});

$("body").on("change", "#storygameListFilters #filterDateMax", function() {
    if (new Date($(this).val()) < new Date($("#filterDateMin").val()))
        $("#filterDateMin").val($(this).val());
});

$("body").on("submit", "#storygameListPagination", function() {
    storyListProcess(true);
    return false;
});

$("body").on("change", "#storygameListPagination select, #storygameListPagination input[type='text']", function() {
    storyListProcess(true);
});

$("body").on("click", "#storygameListPagination input[type='button']", function() {
    if (this.id === "paginationPrev" && storyListPageIndex > 0) storyListPageIndex--, storyListProcess(true);
    else if (this.id === "paginationNext" && storyListPageIndex < storyListPageCount - 1) storyListPageIndex++, storyListProcess(true);
});

$("body").on("click", ".tag:not(.featured)", function() {
    $("#filterTagContainer label:contains(' " + $(this).text() + "')").find("input").prop("checked", true);
    $("[data-for='filterTagContainer']").attr("data-value", $("#filterTagContainer input:checked").length);
    $("#filterTagArray").val($("#filterTagContainer input:checked").map(function() {
        return $(this).parent().text().trim();
    }).get().join(","));
    storyListProcess();
});

$(".main-content").empty().append($("<h1></h1>").html("<a href='./'>Storygames</a> » Search"));

var getHTML = $.get(browser.extension.getURL("html/storylist.html"), (data) => {
        $(".main-content").append($(data));
        $("#filterTagContainer").addClass("loading"),
            $("#storygameList").addClass("loading");
    }),
    getList = $.get(
        href("/story-listings"),
        data => {
            if (data) {
                storyListData = data;
                storyListData.forEach(e => {
                    e.tags.forEach(t => {
                        if (storyListTags.indexOf(t) === -1) storyListTags.push(t);
                    });
                });
            }
        },
        "json"
    );

$.when(getHTML, getList).done(() => {
    $("#filterTagContainer").append(
        storyListTags.sort().map(e => {
            return $("<label></label>").append(
                $("<input>", {
                    type: "checkbox"
                }),
                " ",
                e
            );
        })
    );
    storyListProcess();
    $(".loading").removeClass("loading");
});
