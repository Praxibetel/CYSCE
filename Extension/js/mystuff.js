var flexContainer,
    notepadMirror,
    stuffTable = [
        [
            ["storygames", 2],
            ["notepad"]
        ],
        [
            ["points"],
            ["commendations"],
            ["saves"]
        ]
    ];

$("form > table + table").replaceWith($("<div></div>", {
    id: "MyStuffContainer"
}));

flexContainer = $("#MyStuffContainer");

for (var row of stuffTable) {
    var flexRow = $("<div></div>", {
        class: "flex row"
    });
    for (var col of row) {
        flexRow.append($("<div></div>", {
            class: `flex col ${col[0]}`,
            "data-ratio": col[1] ? col[1] : 1
        }));
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

$.get("Points.aspx", data => {
    $(".flex.points").append(
        $("<h2></h2>").append($("<a></a>", {
            href: "Points.aspx"
        }).text("EXP Points")),
        $("<div></div>", {
            class: "flex-sub"
        }).append($("<table></table>").append($(data).find("tr").slice(1, 25)))
    );
});

$.get("/user/endorsements?username=" + $("#Cys_DisplayName").text(), data => {
    $(".flex.commendations").append(
        $("<h2></h2>").append($("<a></a>", {
            href: "/user/endorsements?username=" + $("#Cys_DisplayName").text()
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
