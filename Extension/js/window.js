chrome.runtime.sendMessage({
    action: "CYSgetTheme"
}, (response) => {
    if (response) {
        var style = $("<style></style>", {
            id: "CYS-Theme"
        }).text(response.theme || "");
        console.log(!!document.body);
        if (document.head || document.documentElement) $(document.head || document.documentElement).append(style), $(() => $("style#CYS-Theme").appendTo("head"));
        else $(() => $("head").append(style));
    }
});


Object.assign(CodeMirror.defaults, {
    autoCloseBrackets: true,
    extraKeys: {
        "Tab": function(cm) {
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
        }
    },
    lineNumbers: true,
    lineWrapping: true,
    theme: "bespin",
    workDelay: 800,
    workTime: 600
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
