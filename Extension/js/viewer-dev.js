var guid,
    mirror,
    openerId,
    qSaves,
    StoryState = {
      regenerate() {
          let state = [
              Array.from(this.coordinates).map(e => e[1]).join(","),
              this.history.join(","),
              Array.from(this.links).map(e => e.join(",")).join(";"),
              Array.from(this.items).map(e => [e[0], e[1].used].join(",")).join(";"),
              Object.entries(this.variables).map(e => e.join(",")).join(";")
          ];
          this.currentDecoded = state;
          this.currentEncoded = btoa(state.join("|"));
      },
      toArray() {
        return this.currentDecoded;
      },
      toString() {
        return this.currentEncoded;
      }
    },
    SSIter,
    SSWorking,
    template,
    URL = new URL(document.location);

document.title = `${decodeURIComponent(URL.searchParams.get("title"))} ${document.title}`;

template = {
    variable: $($("#variable-template").prop("content")),
    item: $($("#item-template").prop("content")),
    qsave: $($("#qsave-template").prop("content")),
}

mirror = CodeMirror.fromTextArea($("#pagetextarea").get(0), {
    lineNumbers: true,
    lineWrapping: true,
    mode: "htmlmixed",
    readOnly: true,
    theme: "base16-dark liga"
});

function newState(data) {
    openerId = data.opener;
    //data.ITEMS = new Map(data.ITEMS);

    StoryState.originalEncoded = data.SS;
    StoryState.currentEncoded = "" + StoryState.originalEncoded;

    StoryState.originalDecoded = atob(StoryState.originalEncoded);
    StoryState.currentDecoded = "" + StoryState.originalDecoded;

    ssWorking = StoryState.originalDecoded.split("|");

    StoryState.coordinates = new Map(ssWorking.shift().split(",").map((e, i) => [
        ["guid", "pageId"][i], e
    ]));

    StoryState.history = ssWorking.shift().split(",").map(e => parseInt(e));

    ssIter = ssWorking.shift();

    StoryState.links = new Map(ssIter ? ssIter.split(";").map(e => e.split(",").map(e => parseInt(e))) : null);

    ssIter = ssWorking.shift();

    StoryState.items = new Map(ssIter ? ssIter.split(";").map(e => e.split(",").map(e => parseInt(e))).map(e => [e[0], Object.assign(data.ITEMS[e[0]] || {}, {
        used: e[1]
    })]) : null);

    StoryState.variables = JSON.parse("{" + ssWorking.shift().replace(/([^;,]*?),/g, "\"$1\",").replace(/,/g, ":").replace(/;/g, ",") + "}");
    StoryState.originalVariables = Object.assign({}, StoryState.variables);

    $("#variable-body").empty();
    $("#link-body").empty();
    $("#item-body").empty();

    for (let i in StoryState.variables) {
        $("#variable-body").append(
            template.variable.clone()
            .find(".variable-name").text(`%${i}:`)
            .end()
            .find(".variable-value").attr({
                "data-name": i,
                "data-value": StoryState.variables[i],
                value: StoryState.variables[i]
            })
            .end()
        );
    }

    for (let i of Array.from(StoryState.links).sort((a, b) => a[0] - b[0])) {
        $("#link-body").append($("<li></li>").append(
            $("<span></span>").text(`$LINKUSED${i[0]}:`),
            $("<span></span>").text(i[1])
        ));
    }

    for (let i of Array.from(StoryState.items).sort((a, b) => a[0] - b[0])) {
        $("#item-body").append(
            template.item.clone()
            .find(".item-image").attr("src", `https://chooseyourstory.com/i/${i[1].image ? `?${i[1].image}` : "object.gif"}`)
            .end()
            .find(".item-name").text(i[1].name || `Item ${i[0]}`)
            .end()
            .find(".item-id").text(`$ITEMUSED${i[0]}:`)
            .end()
            .find(".item-used").attr({
                "data-id": i[0],
                "data-value": i[1].used,
                value: i[1].used
            })
            .end()
        );
    }

    mirror.setValue(html_beautify(data.PAGETEXT));

    $("#breadcrumb-content").empty().append(StoryState.history.map((e, i) => $(`<span>${(i === 0 ? "Page ID: "  : "") + e}</span>`)));
}

function addQSave(qSave) {
    let qSS = atob(qSave[1]).split("|");

    $("#qsaves").prepend(
        template.qsave.clone()
        .find("li").data("SS", qSave[1])
        .find(".qsave-name").text(qSave[2] || "Untitled")
        .end()
        .find(".qsave-date").attr({
            "data-timestamp": qSave[0],
            title: moment(qSave[0]).format("LLLL")
        }).text(moment(qSave[0]).fromNow())
        .end()
        .find(".qsave-pageid").text(qSS[0].split(",")[1])
        .end()
        .find(".qsave-score").text(JSON.parse("{" + qSS[4].replace(/([^;,]*?),/g, "\"$1\",").replace(/,/g, ":").replace(/;/g, ",") + "}").SCORE)
        .end()
        .find(".qsave-items").text(qSS[3].split(";").length)
        .end()
        .find(".qsave-links").text(qSS[1].split(",").length)
        .end()
    );
}

function updateVariables() {
    let inputs = $("#variable-body li input[type='number']");
    if (!inputs.length) return;
    inputs.each(function() {
        StoryState.variables[this.dataset.name] = +this.value;
        this.dataset.value = this.value;
        $(this).parent().removeClass("unapplied");
    });
    StoryState.regenerate();
};

function updateItemstates() {
    let inputs = $("#item-body .item-used");
    if (!inputs.length) return;
    inputs.each(function() {
        StoryState.items.set(+this.dataset.id, Object.assign(StoryState.items.get(+this.dataset.id), {used: +this.value}));
        this.dataset.value = this.value;
        $(this).parents("tr").removeClass("unapplied");
    });
    StoryState.regenerate();
};

function encodeState() {
    return btoa([
        Array.from(this.coordinates).map(e => e[1]).join(","),
        this.history.join(","),
        Array.from(this.links).map(e => e.join(",")).join(";"),
        Array.from(this.items).map(e => [e[0], e[1].used].join(",")).join(";"),
        Object.entries(this.variables).map(e => e.join(",")).join(";")
    ].join("|"));
}

$("#header button").click(function() {
    $("#header button").removeClass("active");
    $("#main .tab").removeClass("active");
    $(this).addClass("active");
    $(`#${this.dataset.for}`).addClass("active");
});

$("#variable-body").on("change", "input[type='number']", function() {
    $(this).parent().toggleClass("unapplied", this.value !== this.dataset.value);
});

$("#variable-tab button[data-action='softApply']").click(function() {
    updateVariables();
    browser.tabs.sendMessage(openerId, {
        action: "SVDsoftApply",
        SS: StoryState.toString()
    });
});

$("#variable-tab button[data-action='hardApply']").click(function() {
    updateVariables();
    browser.tabs.sendMessage(openerId, {
        action: "SVDhardApply",
        SS: StoryState.toString()
    });
});

$("#variable-tab button[data-action='reset']").click(function() {
    $("#variable-body li input[type='number']").each(function() {
        this.value = this.dataset.value;
        $(this).parent().removeClass("unapplied");
    });
});

$("#item-body").on("change", ".item-used", function() {
    $(this).parents("tr").toggleClass("unapplied", this.value !== this.dataset.value);
});


$("#item-tab button[data-action='softApply']").click(function() {
    updateItemstates();
    browser.tabs.sendMessage(openerId, {
        action: "SVDsoftApply",
        SS: StoryState.toString()
    });
});

$("#item-tab button[data-action='hardApply']").click(function() {
    updateItemstates();
    browser.tabs.sendMessage(openerId, {
        action: "SVDhardApply",
        SS: StoryState.toString()
    });
});

$("#item-tab button[data-action='reset']").click(function() {
    $("#item-body .item-used").each(function() {
        this.value = this.dataset.value;
        $(this).parents("tr").removeClass("unapplied");
    });
});

/*

$("#variable-tab button[data-action='revert']").click(function() {
    $("#devPanelList li input[type='number']").each(function() {
        ssVariables = Object.assign({}, ssOriginalVariables);
        this.value = this.dataset.value = ssVariables[this.dataset.name];
        this.parentElement.className = "";
    });
});

*/

$("button[data-for='pagetext-tab']").click(function() {
    mirror.refresh();
});

$("button[data-for='qsave-tab']").click(function() {
    $("#qsaves .qsave-date").text(function() {
        let saveDate = moment(parseInt(this.dataset.timestamp));
        return moment().diff(saveDate, "hours") === 0 ?
            saveDate.fromNow() :
            moment().diff(saveDate, "days") === 0 ?
            saveDate.calendar() :
            saveDate.format("M/D/YYYY h:mm A");
    });
});

$("#qsave-tab button[data-action='qsave']").click(function() {
    let save,
        saveName = prompt("Please enter a name for this quicksave." + ($(".unapplied").length ? "\n\nNote that you have unapplied modified variables or item states that will NOT be reflected in this quicksave." : "")),
        workingSaves;
    if (saveName != null) {
      save = [
        new Date().getTime(),
        StoryState.currentEncoded,
        saveName || "Untitled"
      ]
      browser.storage.local.get(`quicksave${guid}`).then(e => {
        workingSaves = {};
        workingSaves[`quicksave${guid}`] = (e[`quicksave${guid}`] || []).concat([save]);
        browser.storage.local.set(workingSaves).then(() => addQSave(save));
      });
    }
});

$("#qsaves").on("click", "button[data-action='load']", function() {
    if (openerId && confirm(`Are you sure you want to quickload "${$(this).parents("li").find(".qsave-name").text()}?"`)) browser.tabs.sendMessage(openerId, {
        action: "SVDhardApply",
        SS: $(this).parents("li").data("SS")
    });
});

$("#qsaves").on("click", "button[data-action='delete']", function() {
    if (!confirm(`Are you sure you want to delete the quicksave "${$(this).parents("li").find(".qsave-name").text()}?"`)) return;
    browser.storage.local.get(`quicksave${guid}`).then(e => {
      let workingSaves = {};
      workingSaves[`quicksave${guid}`] = (e[`quicksave${guid}`] || []).filter(a => a[0] != $(this).parents("li").find(".qsave-date").data("timestamp"));
      browser.storage.local.set(workingSaves);
    });
    $(this).parents("li").remove();
});

$("#footer").click(function() {
    $("#footer").toggleClass("expanded");
});

browser.runtime.onMessage.addListener((request, sender) => {
    return new Promise(sendResponse => {
        if (request.action === "SVDstoryState") {
            newState(request);
            if (!guid) {
                guid = request.GUID;
                browser.storage.local.get(`quicksave${guid}`).then(e => {
                    qSaves = e[`quicksave${guid}`];
                    if (qSaves)
                        for (let i of qSaves) {
                            addQSave(i);
                        }
                });
            }
        }
    });
});
