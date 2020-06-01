var destyleInit, GUID, ITEMS, PAGETEXT, ss, state,
    url = new URL(document.location);

if (state = url.searchParams.get("state")) url.searchParams.delete("state"), history.replaceState({}, "", url.toString()), hardApply(state);

GUID = new URL(document.location).searchParams.get("StoryId");

ss = $("input[name='SS']").get(0);

ITEMS = Object.fromEntries($(".dark1border + div > ul + table table[id^='Item_']").map(function() {
  return [[parseInt(this.id.match(/\d+$/)[0]), {
    name: $(this).find("h2").first().text().trim(),
    image: parseInt($(this).find("img[src^='/i/']").attr("src").match(/\d*$/)[0]) || null
  }]];
}).get());

PAGETEXT = $(".dark1border + div > div").first().html().trim();

function softApply(state) {
  ss.value = state;
}

function hardApply(state) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
        let form = this.response.querySelector("form");
        form.style.display = "none";
        document.getElementById("pbForm").replaceWith(form);
        form.querySelector("[name='SS']").value = state;
        form.querySelector("[value='Continue Without Saving']").click();
    });
    xhr.open("POST", ("" + document.location).replace("default.aspx", "save.aspx"), true);
    xhr.responseType = "document";
    xhr.send(new FormData(document.getElementById("pbForm")));
}

function pushState() {
  browser.runtime.sendMessage({
      action: "CYSupdateDevWindow",
      GUID,
      SS: ss.value,
      ITEMS,
      PAGETEXT,
      themeName: sessionStorage.getItem("themeName"),
      destyle: sessionStorage.getItem("destyle")
  });
}

pushState();

browser.storage.sync.get(["preferenceDevmode", "preferenceViewerDestyle"]).then((e, error) => {
    if (error) return;
    destyleInit = sessionStorage.getItem("destyle");
    if (destyleInit == null) destyleInit = e.preferenceViewerDestyle;
    let dev = !!(e.preferenceDevmode || window.name === "preview");
    $("#svbanner ul").prepend($("<li></li>", {
        class: "CYSExtension"
    }).append($("<a></a>", {
        href: "#"
    }).text(dev ? "Dev Panel" : "Options").click(function() {
        return browser.runtime.sendMessage({
            action: "CYSopenDevWindow",
            dev,
            title: document.title.split(" :: Story Viewer")[0],
            GUID,
            SS: $("input[name='SS']").val(),
            ITEMS,
            PAGETEXT,
            themeName: sessionStorage.getItem("themeName"),
            destyle: sessionStorage.getItem("destyle")
        }), false;
    })));
    $(".dark1border > h1").data("id", GUID).attr("title", `Page ID: ${GUID}`);
    $(".dark1border + div > ul > li > a").each(function() {
        var id = parseInt($(this).attr("onclick").match(/'(\d+)'/)[1]);
        $(this).data("id", id).attr("title", `Link ID: ${id}`);
    });
    if (destyleInit) {
      if (/\bdestyle-css\b/.test(destyleInit)) document.querySelectorAll(".dark1border + div link, .dark1border + div style").forEach(sheet => {sheet.dataset.media = sheet.media || "", sheet.media = "not all"});
      document.body.className = destyleInit;
    }
});

browser.runtime.onMessage.addListener((request, sender) => {
    return new Promise(sendResponse => {
        if (request.action === "SVDhardApply") return hardApply(request.SS);
        if (request.action === "SVDsoftApply") return softApply(request.SS);
        if (request.action === "SVDsetTempTheme") {
          let style;
          if (!(style = document.getElementById("CYS-Theme"))) style = document.createElement("STYLE"),
            style.id = "CYS-Theme",
            document.head.append(style);
          if (!request.themeName) {
            sessionStorage.removeItem("themeName");
            sessionStorage.removeItem("theme");
            browser.runtime.sendMessage({
                action: "CYSgetViewerTheme"
            }).then(response => style.textContent = response.theme);
          } else {
            style.textContent = request.theme;
            sessionStorage.setItem("themeName", request.themeName);
            sessionStorage.setItem("theme", request.theme);
          }
          return;
        };
        if (request.action === "SVDsetTempDestyle") {
          let destyle;
          if (request.destyle == null) {
            destyle = destyleInit;
            sessionStorage.removeItem("destyle");
          } else {
            destyle = request.destyle;
            sessionStorage.setItem("destyle", request.destyle);
          }
          console.log(destyle);
          if (/\bdestyle-css\b/.test(destyle)) document.querySelectorAll(".dark1border + div link, .dark1border + div style").forEach(sheet => sheet.media = "not all");
          else document.querySelectorAll(".dark1border + div link, .dark1border + div style").forEach(sheet => sheet.media = sheet.dataset.media || "");
          document.body.className = destyle;
          return;
        };
    });
});

window.addEventListener("pageshow", async event => {
  if (event.persisted) pushState();
});
