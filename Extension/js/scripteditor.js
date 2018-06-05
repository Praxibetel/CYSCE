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

var scriptMirror = CodeMirror.fromTextArea(document.getElementById("ScriptText"), {
    autoCloseBrackets: true,
    extraKeys: {
        "Tab": function(cm) {
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
        }
    },
    lineNumbers: true,
    lineWrapping: true,
    mode: "cysscript",
    theme: "bespin",
    workDelay: 800,
    workTime: 600
});

$("form").submit(function() {
    $("#ScriptText").val(scriptMirror.getValue());
});

$(window).on("load", function() {
    scriptMirror.refresh();
});
