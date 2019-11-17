var alerts, fetchIfTagged, theme = {}, viewerWindow = {};

getTheme("main", (data) => theme.main = data);
getTheme("viewer", (data) => theme.viewer = data);

browser.webNavigation.onCommitted.addListener(tab => {
    if (!theme.viewer) return;
    browser.tabs.executeScript(tab.tabId, {
        code: `var css = ${JSON.stringify(theme.viewer)};`,
        runAt: "document_start"
    }), browser.tabs.executeScript(tab.tabId, {
        file: "/js/css.js",
        runAt: "document_start"
    });
}, {
    url: [{
        hostEquals: "chooseyourstory.com",
        pathPrefix: "/story/viewer/"
    }]
});

browser.windows.onRemoved.addListener(windowId => {
    let i;
    //console.log("window", windowId);
    if (i = Object.entries(viewerWindow).find(e => e[1].id === windowId)) delete viewerWindow[i[0]];
});

browser.tabs.onRemoved.addListener(tabId => {
    //console.log("tab", tabId);
    if (tabId in viewerWindow) {
        browser.windows.remove(viewerWindow[tabId].id);
        delete viewerWindow[tabId];
    }
});

browser.storage.sync.get(["preferenceAJAX", "preferenceStifleTags"]).then((e, error) => {
    if (!error && e.preferenceAJAX === "2") fetchIfTagged = !e.preferenceStifleTags, alertInterval();
});

function cacheTheme(sect, callback) {
    browser.storage.sync.get(sect !== "viewer" ? "preferenceTheme" : ["preferenceViewerTheme", "preferenceViewerCPL", "preferenceViewerDestyle", "preferenceViewerSerifs"]).then((e, error) => {
        if (!error && (e.preferenceTheme || e.preferenceViewerTheme) && (e.preferenceTheme !== "none" || e.preferenceViewerTheme !== "none")) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4) {
                    var data = httpRequest.response;
                    if (sect === "viewer") {
                      data = data.replace(/\/\*\!\s*:root\s*\!\*\//, `:root{--font:${
                        e.preferenceViewerSerifs === "serif" ?
                        `"Playfair Display",serif` :
                        `"Route 159",Ubuntu,"Trebuchet MS",sans-serif`
                      };--size:${
                        e.preferenceViewerCPL === "90" ?
                        "calc(1.37097vw - 1.82258px)" : e.preferenceViewerCPL === "110" ?
                        "calc(1.08108vw - 0.75676px)" :
                        "16px"
                      }}`).replace(/@media\s*\(min-width:\s*715px\)/, `@media (min-width: ${
                        e.preferenceViewerCPL === "90" ?
                        "1300" : e.preferenceViewerCPL === "110" ?
                        "1550" :
                        "715"
                      }px)`);
                    }
                    sessionStorage.setItem(sect !== "viewer" ? "theme" : "viewerTheme", JSON.stringify({
                        content: data,
                        timestamp: Date.now()
                    }));
                    callback(data);
                }
            };
            httpRequest.open("GET", `themes/cyslantia-${e.preferenceTheme ? e.preferenceTheme : `viewer-${e.preferenceViewerTheme}`}.min.css`);
            httpRequest.send();
        } else {
            callback("");
        }
    });
}

function getTheme(sect, callback) {
    var e = sessionStorage.getItem(sect !== "viewer" ? "theme" : "viewerTheme");
    if (e && e.content && e.timestamp && e.timestamp > Date.now() - 3600000) return callback(e.content);
    cacheTheme(sect, callback);
}

function alertInterval() {
    processAlerts(() => alerts = setTimeout(alertInterval, 15000));
}

function fetchAlerts(callback) {
    var httpRequest = new XMLHttpRequest(),
        n = {
            messages: 0,
            notifications: 0
        };
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) {
            var data = httpRequest.response;
            if (data) {
                data = JSON.parse(data);
                if (data && data.length) {
                    data.forEach(i => {
                        switch (i.type || null) {
                            case "newmessage":
                                n.messages = parseInt(i.message.match(/\d[\d,]*/)[0].replace(/,/g, ""));
                                break;
                            case "notification":
                                if (fetchIfTagged || !/tagged/.test(i.message)) n.notifications++;
                                break;
                        }
                    });

                }
            }
            if (typeof callback === "function") callback(n);
        }
    };
    httpRequest.open("GET", "http://chooseyourstory.com/alerts");
    httpRequest.send();
}

function processAlerts(callback) {
    var badge, n;
    fetchAlerts(a => {
        alerts = a;
        n = a.messages + a.notifications
        browser.browserAction.setBadgeText({
            text: n ? n < 1000 ? `${n}` : "999+" : ""
        });
        if (typeof callback === "function") callback();
    });
}


browser.runtime.onMessage.addListener((request, sender) => {
    return new Promise(sendResponse => {
        switch (request.action) {
            case "CYSgetTheme":
                sendResponse({
                    theme: theme.main
                });
                break;
            case "CYSupdateTheme":
                cacheTheme("main", data => {
                    theme.main = data;
                    sendResponse({
                        theme: theme.main
                    });
                });
                //return true;
                break;
            case "CYSgetViewerTheme":
                sendResponse({
                    theme: theme.viewer
                });
                break;
            case "CYSupdateViewerTheme":
                cacheTheme("viewer", data => {
                    theme.viewer = data;
                    sendResponse({
                        theme: theme.viewer
                    });
                });
                //return true;
                break;
            case "CYSupdatePreference":
                switch (request.key) {
                    case "preferenceAJAX":
                        if (request.value === "2") {
                            if (alerts == null) alertInterval();
                        } else {
                            if (alerts != null) {
                                alerts = clearInterval(alerts);
                                browser.browserAction.setBadgeText({
                                    text: ""
                                });
                            }
                        }
                        break;
                    case "preferenceStifleTags":
                        fetchIfTagged = !request.value;
                        break;
                }
                sendResponse(true);
                break;
            case "CYSopenDevWindow":
              if (sender.tab.id in viewerWindow && viewerWindow[sender.tab.id]) return viewerWindow[sender.tab.id];
              browser.windows.create({
                type: "panel",
                url: `${browser.extension.getURL("html/dev-panel.html")}?title=${request.title}`,
                width: 600,
                height: 480
              }).then((resolve, reject) => {
                if (resolve) {
                  viewerWindow[sender.tab.id] = resolve;
                  browser.tabs.onUpdated.addListener(function listener (tabId, info) {
                      if (info.status === "complete" && tabId === resolve.tabs[0].id) {
                          chrome.tabs.onUpdated.removeListener(listener);
                          browser.tabs.sendMessage(resolve.tabs[0].id, Object.assign(request, {
                            action: "SVDstoryState",
                            opener: sender.tab.id
                          }));
                      }
                  });
                }
                sendResponse(resolve || reject);
              });
              break;
            case "CYSupdateDevWindow":
              if (sender.tab.id in viewerWindow && viewerWindow[sender.tab.id]) {
                browser.tabs.sendMessage(viewerWindow[sender.tab.id].tabs[0].id, Object.assign(request, {
                  action: "SVDstoryState",
                  opener: sender.tab.id
                }));
                sendResponse(true);
              } else sendResponse(false);
              break;
          case "CYScloseDevWindow":
            if (sender.tab.id in viewerWindow && viewerWindow[sender.tab.id]) {
              browser.windows.remove(viewerWindow[sender.tab.id].id);
              delete viewerWindow[sender.tab.id];
              sendResponse(true);
            } else sendResponse(false);
            break;
        }
    });
});
