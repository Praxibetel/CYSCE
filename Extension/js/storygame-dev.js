var ss, ssIter, ssCoords, ssHistory, ssLinks, ssItems, ssVariables, ssOriginalVariables;

ss = atob($("input[name='SS']").val()).split("|");

ssCoords = new Map(ss.shift().split(",").map((e, i) => [
    ["guid", "pageId"][i], e
]));
ssHistory = ss.shift().split(",").map(e => parseInt(e));
ssIter = ss.shift();
ssLinks = new Map(ssIter ? ssIter.split(";").map(e => e.split(",").map(e => parseInt(e))) : null);
ssIter = ss.shift();
ssItems = new Map(ssIter ? ssIter.split(";").map(e => e.split(",").map(e => parseInt(e))) : null);
ssVariables = JSON.parse("{" + ss.shift().replace(/([^;,]*?),/g, "\"$1\",").replace(/,/g, ":").replace(/;/g, ",") + "}");
ssOriginalVariables = Object.assign({}, ssVariables);

function rebuildSS() {
    return btoa([
        unmap(ssCoords).map(e => e[1]).join(","),
        ssHistory.join(","),
        unmap(ssLinks).map(e => e.join(",")).join(";"),
        unmap(ssItems).map(e => e.join(",")).join(";"),
        Object.entries(ssVariables).map(e => e.join(",")).join(";")
    ].join("|"));
}

function unmap(map) {
    var array = [];
    map.forEach((value, key) => array.push([key, value]));
    return array;
}

var devPanel = $("<div></div>", {
    id: "devPanel",
    class: "CYSExtension"
}).append($("<ul></ul>", {
    id: "devPanelList"
}), $("<div></div>", {
    id: "devPanelButtons"
}).append(
    $("<button></button>", {
        id: "devPanelUpdate"
    }).text("Apply").click(function() {
        $("#devPanelList li input[type='number']").each(function() {
            ssVariables[this.dataset.name] = +this.value;
            this.dataset.value = this.value;
            this.parentElement.className = "";
        });
        $("input[name='SS']").val(rebuildSS());
    }), $("<button></button>", {
        id: "devPanelCancel"
    }).text("Cancel").click(function() {
        $("#devPanelList li input[type='number']").each(function() {
            this.value = this.dataset.value;
            this.parentElement.className = "";
        });
        $("input[name='SS']").val(rebuildSS());
    }), $("<button></button>", {
        id: "devPanelReset"
    }).text("Reset").click(function() {
        $("#devPanelList li input[type='number']").each(function() {
            ssVariables = Object.assign({}, ssOriginalVariables);
            this.value = this.dataset.value = ssVariables[this.dataset.name];
            this.parentElement.className = "";
        });
        $("input[name='SS']").val(rebuildSS());
    }), $("<input>", {
        id: "devPanelHeight",
        type: "range",
        min: 18,
        max: 100,
    }).val(37).change(function() {
        $("#devPanel").css("height", `calc(${$(this).val()}vh - 20px)`);
    }))).hide();

for (var i in ssVariables) {
    devPanel.find("#devPanelList").append($("<li></li>").append($("<span></span>").text(i + ": "), $("<input>", {
        "data-name": i,
        "data-value": ssVariables[i],
        type: "number",
        value: ssVariables[i]
    })));
}

devPanel.on("change", "#devPanelList input[type='number']", function() {
    $(this).parent().toggleClass("unapplied", this.value !== this.dataset.value);
});

$("#svbanner").after(devPanel, $("<div></div>", {
    id: "devPanelOverlay",
    class: "CYSExtension"
}));

chrome.storage.sync.get("preferenceDevmode", e => {
    if ((!chrome.runtime.lastError && e.preferenceDevmode) || /adveditor/i.test(opener.location)) {
        $("#svbanner ul").prepend($("<li></li>", {
            class: "CYSExtension"
        }).append($("<a></a>", {
            href: "#"
        }).text("Variables").click(function() {
            return $("#devPanel").toggle(), false
        })));
        $(".dark1border > h1").data("id", ssCoords.get("pageId")).attr("title", `Page ID: ${ssCoords.get("pageId")}`);
        $(".dark1border + div > ul > li > a").each(function() {
            var id = parseInt($(this).attr("onclick").match(/'(\d+)'/)[1]);
            $(this).data("id", id).attr("title", `Link ID: ${id}`);
        });
    }
});
