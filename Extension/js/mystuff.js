var flexContainer,
    notepadMirror,
    sidebar,
    sortableOptions,
    stuffTable = [
        [{
                widget: "storygames",
                factor: 2
            },
            {
                widget: "notepad"
            }
        ],
        [{
                widget: "points"
            },
            {
                widget: "commendations"
            },
            {
                widget: "saves"
            }
        ]
    ],
    usedWidgets = [],
    widgets = [{
            name: "storygames",
            display: "story-games"
        },
        {
            name: "messages",
            display: "mes-sages",
            limit: 100
        },
        {
            name: "duels"
        },
        {
            name: "saves"
        },
        {
            name: "comments",
            display: "com-ments",
            limit: 50
        },
        {
            name: "points",
            limit: 500
        },
        {
            name: "commendations",
            display: "com-men-da-tions",
            limit: 500
        },
        {
            name: "notepad",
            display: "note-pad"
        },
        {
            name: "spacer",
            display: "⬌"
        }
    ];

$("form > table + table").empty();
chrome.storage.sync.get("myStuffConfig", e => {
    if (!chrome.runtime.lastError && e.myStuffConfig) stuffTable = e.myStuffConfig;

    if ($("#MainContentPlaceHolder_btnNormalMode").length) {
        // Edit Mode
        $("form > table + table").replaceWith($("<div></div>", {
            id: "MyStuffEditor"
        }).append($("<div></div>", {
            id: "MyStuffContainer"
        }), $("<div></div>", {
            id: "MyStuffSidebar"
        })));

        flexContainer = $("#MyStuffContainer");
        sidebar = $("#MyStuffSidebar");

        for (var row of stuffTable) {
            var flexRow = $("<div></div>", {
                class: "flex row"
            });
            for (var col of row) {
                if (col.widget) flexRow.append(createWidget(col, true)), usedWidgets.push(col.widget);
            }
            flexContainer.append(flexRow);
        }

        sidebar.append(
            $("<h2></h2>").text("Widgets"),
            widgets.filter(i => i.name === "spacer" || !usedWidgets.includes(i.name)).map(i => createWidget(i, true))
        );
        sortableOptions = {
            connectWith: "#MyStuffSidebar, .flex.row",
            cursor: "dragging",
            cursorAt: {
                left: -10,
                top: -6
            },
            helper: (event, e) => $("<div></div>", {
                class: "ui-sortable-helper"
            }).text(e.attr("data-name")),
            items: ":not(h2)",
            receive: myStuffUpdate,
            tolerance: "pointer",
            update: myStuffUpdate
        };
        $("#MyStuffSidebar, .flex.row").sortable(sortableOptions);
        myStuffUpdateRows();
        myStuffUpdatePercentage();
    } else {
        $("form > table + table").replaceWith($("<div></div>", {
            id: "MyStuffContainer"
        }));

        flexContainer = $("#MyStuffContainer");

        for (var row of stuffTable) {
            var flexRow = $("<div></div>", {
                class: "flex row"
            });
            for (var col of row) {
                flexRow.append(createWidget(col));
            }
            flexContainer.append(flexRow);
        }

        $.get("Games.aspx", data => {
            $(".flex.storygames").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "Games.aspx"
                }).text("Storygames")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr").slice(1)))
            );
        });

        $.get("messages", data => {
            $(".flex.messages").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "messages"
                }).text("Messages")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr:not(:last-child)").slice(1, 25).each(function() {
                    $(this).find("> :first-child").remove();
                })))
            );
        });

        $.get("Duels/open.aspx", data => {
            $(".flex.duels").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "Duels/default.aspx"
                }).text("Duels")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr").slice(1, 25)))
            );
        });

        $.get("Comments.aspx", data => {
            $(".flex.comments").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "Comments.aspx"
                }).text("Comments")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<div></div>").append($(data).find("#mainContent > div > div").slice(0, 1)))
            );
        });

        $.get(`/user/points?username=${$("#Cys_DisplayName").text()}`, data => {
            $(".flex.points").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: `/user/points?username=${$("#Cys_DisplayName").text()}`
                }).text("EXP Points")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr").slice(1, 25)))
            );
        });

        $.get(`/user/endorsements?username=${$("#Cys_DisplayName").text()}`, data => {
            $(".flex.commendations").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: `/user/endorsements?username=${$("#Cys_DisplayName").text()}`
                }).text("Commendations")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr").slice(1, 25)))
            );
        });

        $.get("Saves.aspx", data => {
            $(".flex.saves").append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "Saves.aspx"
                }).text("Saves")),
                $("<div></div>", {
                    class: "flex-sub"
                }).append($("<table></table>").append($(data).find("tr").slice(2)))
            );
        });

        $(".flex.notepad").append(
            $("<div></div>", {
                class: "flex-dom"
            }).append(
                $("<h2></h2>").append($("<a></a>", {
                    href: "notepad"
                }).text("Notepad")),
                $("<a></a>", {
                    href: "#save",
                    class: "button"
                }).click(function() {
                    $("#notepadFrame").contents().find("form > textarea").val(notepadMirror.getValue());
                    $("#notepadFrame").contents().find("input[name='__EVENTTARGET']").val("ctl11");
                    $("#notepadFrame").contents().find("form").submit();
                    return false;
                }).append($("<img>", {
                    src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/disk.png"
                }), " Save Changes")),
            $("<div></div>", {
                class: "flex-sub"
            }).append($("<iframe></iframe>", {
                id: "notepadFrame",
                hidden: true,
                src: "http://chooseyourstory.com/my/notepad"
            }).on("load", () => {
                if (!notepadMirror) notepadMirror = CodeMirror(mirror => $(".flex.notepad > .flex-sub").append(mirror), {
                    mode: "markdown",
                    scrollbarStyle: null,
                    value: $("#notepadFrame").contents().find("form > textarea").val()
                });
                else notepadMirror.setValue($("#notepadFrame").contents().find("form > textarea").val());
                notepadMirror.refresh();
            }))
        );

        $(window).on("load", function() {
            if (notepadMirror) notepadMirror.refresh();
        });
    }
});

function createWidget(options, edit = false) {
    if (edit) {
        var currentWidget = options.name ? options : widgets.find(i => i.name === options.widget),
            attributes = {
                class: "flex col",
                "data-name": currentWidget ? currentWidget.name : "spacer",
                "data-displayname": currentWidget ? currentWidget.display ? currentWidget.display.replace(/-/g, "\u00AD") : currentWidget.name : "⬌",
                "data-ratio": options.factor ? options.factor : 1,
                "data-limit": options.limit ? options.limit : currentWidget && currentWidget.limit ? currentWidget.limit : null
            };
        return $("<div></div>", attributes).append(
            $("<select></select>")
            .append(
                [...Array(6).keys()].map(i =>
                    $("<option></option>", {
                        value: i + 1,
                        selected: options.factor === i + 1
                    }).text(i + 1)
                )
            )
            .change(function() {
                $(this)
                    .parent()
                    .attr("data-ratio", this.value);
                myStuffUpdate();
            })
        );
    } else return $("<div></div>", {
        class: `flex col ${options.widget || "spacer"}`,
        "data-ratio": options.factor || 1,
        "data-limit": options.limit || null
    });
}

function myStuffChange() {
    if ($("#MyStuffSidebar > [data-name='spacer']").length) $("#MyStuffSidebar > [data-name='spacer']").slice(1).remove();
    else $("#MyStuffSidebar").append($("<div></div>", {
        class: "flex col ui-sortable-handle",
        "data-ratio": 1,
        "data-name": "spacer",
        "data-displayname": "⬌"
    }));
}

function myStuffUpdateRows() {
    $(".flex.row:empty + :empty").remove();
    if ($("#MyStuffContainer").is(":empty") || !$(".flex.row:last-child").is(":empty")) $("#MyStuffContainer").append($("<div></div>", {
        class: "flex row"
    }).sortable(sortableOptions));
}

function myStuffUpdatePercentage() {
    $(".flex.row").each(function() {
        var columns = $(this).find("> .flex.col"),
            ratioTotal;
        if (columns.length) {
            ratioTotal = columns
                .map(function() {
                    return +this.dataset.ratio;
                })
                .get()
                .reduce((a, b) => a + b);
            columns.each(function() {
                $(this).attr(
                    "data-percentage",
                    `${Math.round(100 * (+this.dataset.ratio / ratioTotal))}%`
                );
            });
        }
    });
}

function myStuffUpdate() {
    myStuffChange();
    var tempTable = [];
    $(".flex.row").each(function() {
        var columns = $(this).find("> .flex.col"),
            colArray = [];
        if (columns.length) {
            columns.each(function() {
                colArray.push({
                    widget: $(this).attr("data-name"),
                    factor: +$(this).attr("data-ratio")
                });
            });
            tempTable.push(colArray);
        }
    });
    chrome.storage.sync.set({
        myStuffConfig: tempTable
    });
    myStuffUpdateRows();
    myStuffUpdatePercentage();
}
