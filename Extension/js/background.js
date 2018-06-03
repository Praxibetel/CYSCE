var theme;

getTheme((data) => theme = data);

function cacheTheme(callback) {
    chrome.storage.sync.get("preferenceTheme", (e) => {
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
                    callback(data)
                };
            };
            httpRequest.open("GET", "themes/cyslantia-" + e.preferenceTheme + ".min.css");
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
    if (e && e.content && e.timestamp) {
        if (e.timestamp > Date.now() - 3600 * 1000) {
            return callback(e.content);
        }
    }
    cacheTheme(callback);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CYSgetTheme") {
        sendResponse({
            theme: theme
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CYSupdateTheme") {
        cacheTheme((data) => {
            theme = data;
            sendResponse({
                theme: theme
            });
        });
        return true;
    }
});
