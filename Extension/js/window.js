var AJAX, CMAutobreak, CMCYSScript, CMHTML, CMReady, protocol;

AJAX = new Promise((resolve, reject) => {
    browser.storage.sync.get("preferenceAJAX").then((e, error) => {
        if (error) reject(error);
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

CMReady = browser.storage.sync.get(["preferenceCodeMirrorAutobracket", "preferenceCodeMirrorAutobreak", "preferenceCodeMirrorAutoclose", "preferenceCodeMirrorLigature", "preferenceCodeMirrorTheme"]).then((e, error) => {
    if (error) return;
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
        theme: `${e.preferenceCodeMirrorTheme || "base16-dark"}${e.preferenceCodeMirrorLigature ? " liga" : ""}`,
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

CodeMirror.registerHelper("hint", "tagHint", function(editor, callback) {
    return (async (resolve, reject) => {
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line),
            start = cur.ch,
            end = start,
            search = [];
        while (end < curLine.length && /[@\w$-]/.test(curLine.charAt(end))) ++end;
        while (start && /[@\w$-]/.test(curLine.charAt(start - 1))) --start;
        var curWord = start !== end && curLine.slice(start, end);
        if (!/^@/.test(curWord)) curWord = "";
        var regex = new RegExp('^' + curWord.slice(1), 'i');
        var online = $(".footer-content > div > a").map(function() {
            return $(this).text()
        }).get(),
            op = $(".avatar-container a").first().text();
        if (op && !online.includes(op)) online.push(op);
        online = online.filter(user => regex.test(user)).sort((a, b) => {
            a = a.toLowerCase(), b = b.toLowerCase()
            return a > b ? 1 : a < b ? -1 : 0;
        });
        if (curWord.length > 3) {
            try {
                search = JSON.parse(await $.get(`https://chooseyourstory.com/0x44/ChooseYourStory.WebApplication/ChooseYourStory.WebApplication.Pages.Messages.NewMessagePage+UsernameTextBox/ProcessUsernameRequest?term=${curWord.slice(1)}`))
                    .filter(user => !online.includes(user))
                    .sort((a, b) => {
                        a = a.toLowerCase(), b = b.toLowerCase()
                        return a > b ? 1 : a < b ? -1 : 0;
                    });
            } catch (e) {}
        }
        callback({
            list: (!curWord ? [] : online.concat(search).map(user => ({
                text: `@${user}`,
                displayText: user
            }))),
            from: CodeMirror.Pos(cur.line, start),
            to: CodeMirror.Pos(cur.line, end)
        });
    })();
});

CodeMirror.commands.autocomplete = function(cm) {
    CodeMirror.showHint(cm, CodeMirror.hint.tagHint, {
        async: true
    });
};

function CMPreLine(text) {
    return `<div data-autobreak style="white-space: pre-line;">${text}</div>`;
}

function CMUnPreLine(text) {
    return text.replace(/^<div *data-autobreak(?:=["']{2}) *style=["'] *white-space: *pre-line *;? *["']>([\s\S]*?)<\/div>$/gi, "$1");
}

function href(pathname) {
  return new URL(pathname, document.location).toString();
}

function dynamicizeForumPosts(selector) {
    let noParent = ["SCRIPT", "STYLE"];
    selector = `${selector}, ${selector} *`;
    $(selector).contents().filter(function() {
        return (this.nodeType == 3 && !noParent.includes(this.parentNode.nodeName) && $.trim(this.nodeValue) && /@[\w-]{4,}/.test(this.data))
    }).each(function() {
        var div = $("<div></div>"),
            node = $(this);
        div.html(node.text().replace(/@([\w-]{4,})/g, "<a href='/Member/?Username=$1'>$&</a>"));
        node.before(div.contents()).remove();
    });
    $(selector).contents().filter(function() {
        return (this.nodeType == 3 && !noParent.includes(this.parentNode.nodeName) && this.parentNode.nodeName !== "A" && $.trim(this.nodeValue) && /\b(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/i.test(this.data))
    }).each(function() {
        var div = $("<div></div>"),
            node = $(this);
        div.html(node.text().replace(/\b(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/gi, url => `<a href="${url.replace(/"/g, "&quot;")}">${url}</a>`));
        node.before(div.contents()).remove();
    });
    $(selector).contents().filter(function() {
        return (this.nodeType == 3 && !noParent.includes(this.parentNode.nodeName) && $.trim(this.nodeValue) && /\[\s*spoiler(\s*=\s*.*?)?\s*].*?\[\s*\/\s*spoiler\s*]/i.test(this.data))
    }).each(function() {
        var div = $("<div></div>"),
            node = $(this);
        div.html(node.text()
            .replace(/\[\s*spoiler\s*=\s*"(.*?)"\s*](.*?)\[\s*\/\s*spoiler\s*]/gi, `<x-spoiler title="$1">$2</x-spoiler>`)
            .replace(/\[\s*spoiler\s*=\s*'(.*?)'\s*](.*?)\[\s*\/\s*spoiler\s*]/gi, `<x-spoiler title='$1'>$2</x-spoiler>`)
            .replace(/\[\s*spoiler\s*=\s*(.*?)\s*](.*?)\[\s*\/\s*spoiler\s*]/gi, ($$, $1, $2) => `<x-spoiler title="${$1.replace(/"/gi, "&quot;")}">${$2}</x-spoiler>`)
            .replace(/\[\s*spoiler\s*.*?\s*](.*?)\[\s*\/\s*spoiler\s*]/gi, `<x-spoiler>$1</x-spoiler>`)
        );
        node.before(div.contents()).remove();
    });
}
