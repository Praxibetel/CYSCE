var ajax,
    importInput = document.createElement("INPUT"),
    table = $(`<table class="smallerText" border="0" cellpadding="3" cellspacing="0"><tbody></tbody></table>`),
    titles = {};
importInput.type = "file";
importInput.accept = "application/json";
document.body.appendChild(importInput);
importInput.style.display = "none";

$(".main-content").append(
    $("<br>"),
    $("<h1></h1>").text("Quicksaves"),
    table
);

AJAX.then((resolve, reject) => {
    ajax = !!resolve;
    table.find("tbody").append(
        $("<tr></tr>").append(
            $(`<td colspan="4" style="text-align: right;"></td>`).append(
                $(`<input type="button" value="Import from JSON" />`).click(importQSaves),
                " ",
                $(`<input type="button" value="Export as JSON" />`).click(exportQSaves),
            )
        ),
        $(`<tr style="font-weight: 700;"><td>Date</td><td>${ajax ? "Game" : "Game ID"}</td><td colspan="2">Save</td></tr>`)
    );
    browser.storage.local.get(null).then(async e => {
        let arr = [];
        for (let i in e) {
            if (/^quicksave\d+$/.test(i)) {
                let id = parseInt(i.match(/^quicksave(\d+)$/)[1]);
                arr = arr.concat(e[i].map(a => [id].concat(a)));
                if (ajax) titles[id] = $(await $.get(`//chooseyourstory.com/story/viewer/default.aspx?StoryId=${id}`)).filter("title").text().split("::")[0].trim();
            }
        }
        arr.sort((a, b) => b[1] - a[1]);
        for (let i of arr) table.find("tbody").append($("<tr></tr>", {
            "data-guid": i[0],
            "data-timestamp": i[1],
            "data-SS": i[2],
            "data-name": i[3] || "Untitled",
        }).append(
            $("<td></td>").text(moment(i[1]).format("M/D/YYYY h:mm A")),
            $("<td></td>").append(ajax ? $("<a></a>", {
                href: `../story/${encodeURIComponent(titles[i[0]]).replace(/[-_.~"]/g, (c) => `%${c.charCodeAt(0).toString(16)}`).replace(/%/g, "~").toLowerCase()}`
            }).text(titles[i[0]]) : i[0]),
            $("<td></td>").text(i[3] || "Untitled"),
            $("<td></td>").append(
                $(`<a href="#"></a>`).text("[restore]").click(() => {
                    window.open(
                        `/story/viewer/default.aspx?StoryId=${i[0]}&state=${i[2]}`,
                        `_game${i[0]}`,
                        `height=600,width=737,directories=no,location=no,resizable=yes,menubar=no,toolbar=no,scrollbars=yes`
                    );
                    return false;
                }),
                " &nbsp; ",
                $(`<a href="#"></a>`).text("[delete]").click(function() {
                    let tr = $(this).parents("tr");
                    if (!confirm(`Are you sure you want to delete the quicksave "${tr.data("name")}?"`)) return false;
                    browser.storage.local.get(`quicksave${tr.data("guid")}`).then(e => {
                      let workingSaves = {};
                      workingSaves[`quicksave${tr.data("guid")}`] = (e[`quicksave${tr.data("guid")}`] || []).filter(a => a[0] != tr.data("timestamp"));
                      browser.storage.local.set(workingSaves);
                    });
                    tr.remove();
                    return false;
                })
            ),
        ));
    });
});

async function exportQSaves() {
    try {
        let download,
            file,
            json = {},
            saves = await browser.storage.local.get(null)
        url;

        for (let i in saves) {
            if (/^quicksave\d+$/.test(i)) json[i.match(/^quicksave(\d+)$/)[1]] = saves[i].map(s => ({
                timestamp: s[0],
                SS: s[1],
                name: s[2] || null
            }));
        }

        file = new File([JSON.stringify(json, null, "\t")], `CYS_Quicksaves_${moment().format("YYYY-MM-DD_HH.mm.ss")}.json`, {
            type: "application/octet-stream",
        });

        url = URL.createObjectURL(file);
        download = document.createElement("A");
        document.body.appendChild(download);
        download.style.display = "none";
        download.href = url;
        download.download = file.name;
        download.click();
        document.body.removeChild(download);
        URL.revokeObjectURL(url);
    } catch (e) {}
}

function importQSaves() {
    importInput.files = null;
    importInput.click();
    $(importInput).one("input", async function() {
        if (this.files.length) try {
            let json = await fileToText(this.files[0]),
                newSaves = {},
                oldSaves = await browser.storage.local.get(null);
            json = JSON.parse(json);
            if (!json || typeof json !== "object" || Array.isArray(json)) throw "Incorrect container format";
            for (let i in json) {
                if (/^\d+$/.test(i) && Array.isArray(json[i])) {
                    let newSave = json[i].filter(s => "timestamp" in s && "SS" in s),
                        oldSave = oldSaves[`quicksave${i}`] || [];
                    newSaves[`quicksave${i}`] = oldSave.filter(s => !newSave.map(s => +s.timestamp).includes(s[0])).concat(json[i].filter(s => "timestamp" in s && "SS" in s).map(s => [
                        +s.timestamp,
                        s.SS,
                        s.name || null
                    ]));
                }
            }
            await browser.storage.local.set(Object.assign(oldSaves, newSaves));
            document.location.reload();
        } catch (e) {}
    });
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    try {
      let reader = new FileReader();
      reader.addEventListener("loadend", () => resolve(reader.result));
      reader.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
}
