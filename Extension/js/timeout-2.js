window.originalSetTimeout = window.setTimeout;
window.originalClearTimeout = window.clearTimeout;
window.activeTimers = 0;

window.setTimeout = function(func, delay) {
    window.activeTimers++;
    return window.originalSetTimeout(func, delay);
};

window.clearTimeout = function(timerID) {
    window.activeTimers--;
    window.originalClearTimeout(timerID);
};

window.originalSetInterval = window.setInterval;
window.originalClearInterval = window.clearInterval;
window.activeIntervals = 0;

window.setInterval = function(func, delay) {
    if (func && delay) {
        window.activeIntervals++;
    }
    return window.originalSetInterval(func, delay);
};
window.clearInterval = function(intervalId) {
    // JQuery sometimes hands in true which doesn't count
    if (intervalId !== true) {
        window.activeIntervals--;
    }
    return window.originalClearInterval(intervalId);
};
