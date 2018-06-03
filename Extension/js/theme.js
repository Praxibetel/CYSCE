chrome.runtime.sendMessage({
    action: "CYSgetTheme"
}, (response) => {
    if (response) {
        var style = $("<style></style>", {
            id: "CYS-Theme"
        }).text(response.theme || "");
        if (document.head || document.documentElement) $(document.head || document.documentElement).append(style), $(() => $("style#CYS-Theme").appendTo("head"));
        else $(() => $("head").append(style));
    }
});
