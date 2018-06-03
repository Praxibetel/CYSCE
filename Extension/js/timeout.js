var s = document.createElement("script");
s.src = chrome.extension.getURL("time-events-manager.js");
s.async = false;
document.documentElement.appendChild(s);
