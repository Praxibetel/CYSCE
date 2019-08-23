var alerts, fetchIfTagged, theme = {};

getTheme("main", (data) => theme.main = data);
getTheme("viewer", (data) => theme.viewer = data);

browser.webNavigation.onCommitted.addListener(function(tab) {
    browser.tabs.insertCSS(tab.tabId, {
        code: theme.viewer,
        runAt: "document_start"
    });
}, {
    url: [{
        hostEquals: "chooseyourstory.com",
        pathPrefix: "/story/viewer/"
    }]
});

browser.storage.sync.get(["preferenceAJAX", "preferenceStifleTags"]).then((e, error) => {
    if (!error && e.preferenceAJAX === "2") fetchIfTagged = !e.preferenceStifleTags, alertInterval();
});

function cacheTheme(sect, callback) {
    browser.storage.sync.get(sect !== "viewer" ? "preferenceTheme" : "preferenceViewerTheme").then((e, error) => {
        if (!error && (e.preferenceTheme || e.preferenceViewerTheme) && (e.preferenceTheme !== "none" || e.preferenceViewerTheme !== "none")) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4) {
                    var data = httpRequest.response;
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
                    console.log(data);
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
            console.log(n);
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


browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
            return true;
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
            return true;
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
    }
});
