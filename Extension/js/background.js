var alerts, fetchIfTagged, theme;

getTheme(data => theme = data);


chrome.storage.sync.get(["preferenceAJAX", "preferenceStifleTags"], e => {
    if (!chrome.runtime.lastError && e.preferenceAJAX === "2") fetchIfTagged = !e.preferenceStifleTags, alertInterval();
});

function cacheTheme(callback) {
    chrome.storage.sync.get("preferenceTheme", e => {
        if (!chrome.runtime.lastError && e.preferenceTheme && e.preferenceTheme !== "none") {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                /*
                  chrome.storage.local.set({
                      theme: {
                          content: data,
                          timestamp: Date.now()
                      }
                  }, () => {
                      callback(data);
                  });
                  */
                if (httpRequest.readyState === 4) {
                    var data = httpRequest.response;
                    sessionStorage.setItem("theme", JSON.stringify({
                        content: data,
                        timestamp: Date.now()
                    }));
                    callback(data);
                }
            };
            httpRequest.open("GET", `themes/cyslantia-${e.preferenceTheme}.min.css`);
            httpRequest.send();
        } else {
            callback("");
        }
    });
}

function getTheme(callback) {
    /*
    chrome.storage.local.get("theme", (e) => {
        if (e.theme && e.theme.content && e.theme.timestamp) {
            if (e.theme.timestamp > Date.now() - 3600 * 1000) {
                return callback(e.theme.content);
            }
        }
        cacheTheme(callback);
    });
    */
    var e = sessionStorage.getItem("theme");
    if (e && e.content && e.timestamp && e.timestamp > Date.now() - 3600000) return callback(e.content);
    cacheTheme(callback);
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
        chrome.browserAction.setBadgeText({
            text: n ? n < 1000 ? `${n}` : "999+" : ""
        });
        if (typeof callback === "function") callback();
    });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "CYSgetTheme":
            sendResponse({
                theme: theme
            });
            break;
        case "CYSupdateTheme":
            cacheTheme(data => {
                theme = data;
                sendResponse({
                    theme: theme
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
                            chrome.browserAction.setBadgeText({
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
