var AJAX, CMAutobreak, CMCYSScript, CMHTML, CMReady;

chrome.runtime.sendMessage({
    action: "CYSgetTheme"
}, response => {
    if (response) {
        var style = $("<style></style>", {
            id: "CYS-Theme"
        }).text(response.theme || "");
        if (!document.body) {
            var observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (!mutation.addedNodes) return
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeName == "BODY") {
                            $(document.head).append(style);
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
        } else $(document.head || document.documentElement).append(style), $(() => $("style#CYS-Theme").appendTo("head"));
    }
});

AJAX = new Promise((resolve, reject) => {
    chrome.storage.sync.get("preferenceAJAX", e => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve(e.preferenceAJAX !== false && e.preferenceAJAX !== "0");
    });
});

CMCYSScript = {
    mode: "cysscript"
};

CMHTML = {
    autoCloseTags: {
        whenOpening: true,
        whenClosing: true,
        indentTags: ["applet", "blockquote", "body", "div", "dl", "fieldset", "form", "frameset", "head", "html", "layer", "legend", "object", "ol", "script", "select", "style", "table", "ul"]
    },
    mode: "htmlmixed"
};

CMReady = chrome.storage.sync.get(["preferenceCodeMirrorAutobracket", "preferenceCodeMirrorAutobreak", "preferenceCodeMirrorAutoclose", "preferenceCodeMirrorTheme"], e => {
    if (chrome.runtime.lastError) return;
    CMAutobreak = e.preferenceCodeMirrorAutobreak === true;
    CMHTML.autoCloseTags.whenClosing = CMHTML.autoCloseTags.whenOpening = e.preferenceCodeMirrorAutoclose !== false;
    Object.assign(CodeMirror.defaults, {
        autoCloseBrackets: e.preferenceCodeMirrorAutobracket !== false,
        extraKeys: {
            Tab(cm) {
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
            }
        },
        lineNumbers: true,
        lineWrapping: true,
        theme: e.preferenceCodeMirrorTheme || "base16-dark",
        workDelay: 800,
        workTime: 600
    });
});

CodeMirror.defineSimpleMode("cysscript", {
    start: [{
            regex: /"/,
            token: "string",
            next: "string"
        },
        {
            regex: /(?:IF|THEN|ELSE)\b/,
            token: "keyword"
        },
        {
            regex: /\$(?:CHAPTERID|PAGEID|PAGETEXT|ITEMUSED\d+|ITEMSTATE\d+|ITEMPAGEID\d+|LINKTEXT\d+|LINKDEST\d+|DEST)\b/,
            token: "variable-2"
        },
        {
            regex: /@(?:[PC]\d+|END|RESET|SAVE|PREV|NONE)\b/,
            token: "atom"
        },
        {
            regex: /\b\d+(D\d+)?\b/,
            token: "number"
        },
        {
            regex: /#.*/,
            token: "comment"
        },
        {
            regex: /[-+\/*:=<>!]+|AND|OR|NOT/,
            token: "operator"
        },
        {
            regex: /[()]/,
            token: "bracket"
        },
        {
            regex: /BEGIN/,
            token: "keyword",
            indent: true
        },
        {
            regex: /END/,
            token: "keyword",
            dedent: true
        },
        {
            regex: /%[A-Z][A-Z0-9]*\b/,
            token: "variable"
        }
    ],
    string: [{
            regex: /"/,
            token: "string",
            next: "start"
        },
        {
            regex: /[^ -~\n\r]+/,
            token: "error"
        },
        {
            regex: /[ !#-~\n\r]+/,
            token: "string"
        }
    ],
    meta: {
        dontIndentStates: ["string"],
        lineComment: "#"
    }
});

CodeMirror.defineSimpleMode("onpage", {
    start: [{
        regex: /(%%)(?:|([A-Z][A-Z0-9]*)|(-?[0-9]+))(%)(!?=|<=?|>=?)(%)(?:|([A-Z][A-Z0-9]*)|(-?[0-9]+))(%)(.*?)(%%)/,
        token: ["keyword", "variable", "number", "keyword", "operator", "keyword", "variable", "number", "keyword", "string", "keyword"]
    }, {
        regex: /(%%)(|[A-Z][A-Z0-9]*)(%%)/,
        token: ["keyword", "variable", "keyword"]
    }]
});

CodeMirror.defineMode("cyshtml", function(config, parserConfig) {
    return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "htmlmixed"), CodeMirror.getMode(config, "onpage"));
});

function CMPreLine(text) {
    return `<div data-autobreak style="white-space: pre-line;">${text}</div>`;
}

function CMUnPreLine(text) {
    return text.replace(/^<div *data-autobreak *style=["'] *white-space: *pre-line *;? *["']>([\s\S]*?)<\/div>$/gi, "$1");
}
