$(".forum-message .heading").each(function(e) {
    $(this).find("h2").add($(this).find(".buttons")).wrapAll($("<div></div>", {
        class: "heading-dom"
    }));
    $(this).find("h2").before($("<div></div>", {
        class: "heading-spacer"
    }));
    $(this).find(".subH2, .text[id]").wrapAll($("<div></div>", {
        class: "heading-sub"
    }));
});

if (!$("script:contains('CKEDITOR.replace')").length) {
    var htmlContent = document.querySelector(".contents > textarea"),
        htmlMirror,
        htmlPreview,
        htmlPreviewToggle,
        htmlFrame,
        username;

    AJAX.then((resolve, reject) => {
        if (reject || !resolve) return;
        htmlPreview = $(`<div class="forum-thread" style="display: none;"><div class="forum-message" style="margin-left:25px">
          <div class="avatar-container"><img class="avatar" src="/i/?" alt=""><a href="#" class="user-name"></a></div><div class="heading"><div class="heading-dom"><div class="heading-spacer"></div><h2>&#8203;</h2></div><div class="heading-sub"><div class="subH2">just now</div></div></div>
          <iframe class="body" sandbox="allow-same-origin" srcdoc='<html>
            <head>
              <link type="text/css" rel="stylesheet" href="../../Resources/Styles/Primary.css?20170008">
              <link type="text/css" rel="stylesheet" href="../../Resources/Styles/layout.css?20170008">
              <style id="seamless">
                html, body {
                  background: transparent !important;
                  min-height: unset !important;
                  padding-bottom: .05px;
                } img {
                  height: auto;
                  max-width: 100%;
                }
              </style>
            </head>
            <body></body>
          </html>' style="height: 0; overflow: hidden; width: calc(100% - 120px);"></iframe>
        </div></div>`);
        htmlPreviewToggle = $("<a></a>", {
            href: "#preview",
            class: "button preview"
        }).click(function() {
            if ($(this).hasClass("previewed")) htmlPreview.hide(),
                $(this).find("span").text("Preview");
            else htmlPreview.show(),
                $(this).find("span").text("Hide"),
                previewResize();
            $(this).toggleClass("previewed");
            return false;
        }).append($("<img>", {
            src: "/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/page_find.png"
        }), " ", $("<span></span>").text("Preview"), $(".forum-message").length ? " Reply" : " Post");
        htmlFrame = htmlPreview.find("iframe");
        username = $("#Cys_DisplayName").text();

        if ($(".forum-message").length) $(".forum-message").wrap($("<div></div>", {
            "class": "forum-thread"
        })).after(htmlPreview).find(".heading-dom").prepend($("<div></div>", {
            class: "buttons"
        }).append(htmlPreviewToggle));
        else $("form h1").before(htmlPreviewToggle.css({
            float: "right",
            "margin-top": "10px"
        })), $(".form-field-group").before(htmlPreview);

        htmlPreview.find("h2").text($(".form-field-group input").val().trim() || "\u200B");
        htmlPreview.find(".user-name")
            .attr("href", `/Member/?Username=${username}`)
            .attr("title", `Profile page for ${username}`)
            .text(username);
        if ($("#CYS-Theme").length) htmlFrame.on("load", () => {
            htmlFrame.contents().find("#seamless").before($("#CYS-Theme").clone());
            htmlFrame.contents().find("body").html(htmlContent.value);
        });
        $.get(href("/My/Profile.aspx")).then(data => htmlPreview.find(".avatar").attr("src", `/i/?${$(data).find("[name='Avatar Image ID']").val()}`));
    });

    browser.storage.sync.get(["preferenceCodeMirror", "preferenceCodeMirrorAtAutocomplete", "preferenceHTMLNormalize"]).then((e, error) => {
        if (!error) {
            if (e.preferenceCodeMirror !== false) {
                htmlMirror = CodeMirror.fromTextArea(htmlContent, CMHTML);

                if (CMAutobreak) htmlMirror.setValue(CMUnPreLine(htmlMirror.getValue()));

                htmlMirror.on("change", function(mirror) {
                    let htmlVal = CMAutobreak ? CMPreLine(mirror.getValue()) : mirror.getValue();
                    htmlContent.value = htmlVal;
                    previewPost(htmlVal);
                });

                if (e.preferenceCodeMirrorAtAutocomplete) htmlMirror.on("keyup", function(cm, event) {
                    if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
                        event.keyCode != 13) { /*Enter - do not open autocomplete list just after item has been selected in it*/
                        CodeMirror.showHint(cm, CodeMirror.hint.tagHint, {
                            async: true
                        });
                    }
                });

                $(window).on("load", function() {
                    htmlMirror.refresh();
                });
            }
            if (e.preferenceHTMLNormalize !== false) {
                $("form > a.button").on("click", function() {
                    let normalizedHTML = $("<div>").append($.parseHTML(htmlContent.value)).html()
                        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, emoji => `&#x${(1024 * emoji.charCodeAt(0) + emoji.charCodeAt(1) - 56613888).toString(16)};`)
                        .replace(/[^\u0000-\u00ff]/g, match => `&#x${match.charCodeAt().toString(16)};`);
                    htmlContent.value = normalizedHTML;
                    return true;
                });
            }
        }
    });

    $(htmlContent).on("input", function() {
        previewPost(this.value);
    });

    $(".form-field-group input").on("input", function() {
        if (htmlPreview) htmlPreview.find("h2").text(this.value.trim() || "\u200B");
    });
}

function previewPost(html) {
    if (htmlFrame) {
        htmlFrame.contents().find("body").html(html);
        previewResize();
        htmlFrame.contents().find("body img[src]").on("load", () => previewResize());
    }
}

function previewResize() {
    if (htmlFrame) {
        let body = htmlFrame.contents().find("body").get(0);
        htmlFrame.css("height", `${body ? body.scrollHeight : 0}px`);
    }
}
