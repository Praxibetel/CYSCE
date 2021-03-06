var TEMP_OVERWRITE = !!sessionStorage.getItem("themeName");

if (TEMP_OVERWRITE || CYSCE_CSS) {
    var style = document.createElement("STYLE");
    style.id = "CYS-Theme";
    style.textContent = TEMP_OVERWRITE ? (sessionStorage.getItem("theme") || "") : CYSCE_CSS;
    if (!document.body) {
        var observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (!mutation.addedNodes) return;
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeName == "BODY") {
                        document.head.append(style);
                        observer.disconnect();
                    }
                }
            });
        });
        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    } else (document.head || document.documentElement).append(style), document.addEventListener("DOMContentLoaded", () => $("style#CYS-Theme").appendTo("head"));
}

if (CYSCE_Class) document.documentElement.classList.add(CYSCE_Class);
