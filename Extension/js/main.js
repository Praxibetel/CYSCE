var e,
    path,
    u = !!$("#Cys_DisplayName").length,
    url = new URL(document.location);

$("link[rel='icon']").replaceWith($("<link>", {
    rel: "icon",
    type: "image/png",
    href: browser.extension.getURL("cysicon-16.png"),
    sizes: "16x16"
}).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: browser.extension.getURL("cysicon-19.png"),
    sizes: "19x19"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: browser.extension.getURL("cysicon-24.png"),
    sizes: "24x24"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: browser.extension.getURL("cysicon-32.png"),
    sizes: "32x32"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: browser.extension.getURL("cysicon-38.png"),
    sizes: "38x38"
})));

if ($(".sidebar-content > ul > li").length > 6) $("#BodyContainer").addClass("compact-navbar");

if (u) $("#Cys_DisplayName").wrap($("<a></a>", {
    href: `/Member/?Username=${$("#Cys_DisplayName").text()}`
}));

switch (path = url.pathname.toLowerCase(), true) {
    case "/" === path:
        dynamicizeForumPosts("h1.alternate + div > div:nth-child(2n)");
        break;
    case "/endorsements" === path:
        $("title").text(`Commendations > All ${url.searchParams.get("sect")}s > ChooseYourStory.com`);
        break;
    case "/user/endorsements" === path:
        $("title").text(`Commendations > ${url.searchParams.get("username")} > ChooseYourStory.com`);
        break;
    case "/user/points" === path:
        $("title").text(`Experience Points > ${url.searchParams.get("username")} > ChooseYourStory.com`);
        break;
    case "/secret/cysid/set-render-mode" === path:
        $("title").text("Abandon all hope, ye who enter here > ChooseYourStory.com");
        break;
    case "/forums/search.aspx" === path:
        $("title").text("Just Google it > ChooseYourStory.com");
        var upDate1 = function() {
                var date = new Date($(`input[name="${$(this).data("for")}"]`).val());
                return isNaN(date) ? "" : `${date.getUTCFullYear()}-${("00" + (date.getUTCMonth() + 1)).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)}`;
            },
            upDate2 = function() {
                var date = new Date(this.value);
                $(`input[name="${$(this).data("for")}"]`).val(isNaN(date) ? "" : `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`);
            }
        $("input[name='d1']").attr("type", "hidden").after($("<input>", {
            type: "date",
            "data-for": "d1"
        }).val(upDate1).on("change", upDate2));
        $("input[name='d2']").attr("type", "hidden").after($("<input>", {
            type: "date",
            "data-for": "d2"
        }).val(upDate1).on("change", upDate2));
        $(".smallerText:contains('MM/DD/YY')").remove();
        $("input[value='Search']").after(" ", $("<form></form>", {
            action: "https://www.google.com/search",
            method: "get",
            style: "display: inline-block;"
        }).submit(function() {
            var e = $(this),
                p = e.parent(),
                date,
                forum,
                query = [],
                username;
            query.push(`site:chooseyourstory.com/forums${(forum = p.find("select[name='f']").val()) ? "/" + [
              null,
              "the-lounge",
              "news-and-updates",
              "the-parlor-room",
              "newbie-central",
              "writing-workshop",
              "advanced-editor-forum",
              "feature-wishing-well",
              "bugs-and-problems",
              "reading-corner",
              null,
              null,
              "creative-corner"
            ][parseInt(forum)] : ""}`.trim(),
                p.find("td input[name='q']").val().trim()
            );
            if (username = p.find("td input[name='u']").val().trim()) query.push(`"${username}"`);
            e.find("input[name='q']").val(query.join(" "));
            date = [p.find("input[name='d1']").val(), p.find("input[name='d2']").val()];
            if (date[0] || date[1]) e.find("input[name='tbs']").val(`cdr:1${date[0] ? ",cd_min:" + date[0] : ""}${date[1] ? ",cd_max:" + date[1] : ""}`);
        }).append($("<input>", {
            type: "hidden",
            name: "q"
        }), $("<input>", {
            type: "hidden",
            name: "tbs"
        }), $("<input>", {
            type: "submit",
            value: "Search Google"
        })));
        break;
      case /^\/my\/adveditor\/chapters\.aspx/.test(path):
          $(".tertiaryButton, .tertiaryButtonSelected").first().parent().replaceWith(function() {
              return $("<ul></ul>", {
                  class: "generic-selector"
              }).append($(this).find(".tertiaryButton, .tertiaryButtonSelected"));
          }).end().parent().parent().addClass("generic-selector-parent");
          break;
      case /^\/advanced_editor\/\d+\/newpage/.test(path):
          $("[name='page_title_text']").focus();
          break;
      case /^(\/my\/duels\/(default|open|history)\.aspx|\/help\/aboutus\.aspx)$/.test(path):
          $(".tertiaryButton").parent().replaceWith(function() {
              return $("<ul></ul>", {
                  class: "generic-selector"
              }).append($(this).find(".tertiaryButton, .tertiaryButtonSelected"));
          });
          break;
      case /^\/help(\/articles)?\/?$/.test(path):
        $.get(browser.extension.getURL("html/articles/articles.json")).then(json => {
          let articleContainer = $(`<div><strong><h1>${browser.runtime.getManifest().name}</h1></strong><br></div>`);
          for (let i = 0; i < json.length; i++) json[i].id = i;
          json.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
          for (let article of json) {
            articleContainer.append($(`
              <h3 style="display:inline"></h3><h2 style="display:inline"><a href="/help/articles/article.aspx?ArticleEx=${article.id}">${article.title}</a></h2><h3> [${article.level >= 2 ? "Expert" : article.level == 1 ? "Intermediate" : "Beginner"}]</h3>&nbsp;<span class="smallerText">by <a href="/member/?username=${article.author}">${article.author}</a></span><br><br>
            `));
          }
          $("#maincontent > div:last-child").append(articleContainer);
        });
        break;
      case path.endsWith("article.aspx"):
        if (/ArticleEx=\d+/i.test(url.search)) {
          $.get(browser.extension.getURL("html/articles/articles.json")).done(json => {
            let id = parseInt(url.search.match(/ArticleEx=(\d+)/i)[1]),
                article;
            if (id in json) {
              article = json[id];
              $("title").text(`${article.title} > Help & Info > ChooseYourStory.com`);
              $("#maincontent > h1:first-child").text(article.title);
              $("#maincontent > p.smallerText > a").attr("href", `../../member/?Username=${article.author}`).text(article.author);
              $.get(browser.extension.getURL(`html/articles/${article.doc}`)).then(html => $("#maincontent > div:last-child").html(html));
            }
          });
        }

        $("title").text(`${$("#maincontent > h1:first-child").text().trim()} > Help & Info > ChooseYourStory.com`);
        $(document.body).append($("<link>", {
            rel: "stylesheet",
            type: "text/css",
            href: browser.extension.getURL("themes/print.css")
        }));
        $(".tertiaryButton").parent().replaceWith(function() {
            return $("<ul></ul>", {
                class: "help-info-selector"
            }).append($(this).find(".tertiaryButton"));
        });
        break;
      /*
      case /^\/secret\/BradinDvorak/i.test(path):
        $.get("/secret/cysid/set-render-mode", html => {
          if (html) {
            console.log($(html).find("head").html());
            $("head").html($(html).find("head").html());
            //$(document.body).html($(html).find("body").find(".main-content > form").remove().end().html());
          }
        });
        //break;
      case /\142u(\x6b){2}a\1(?=e\b)/i.test(path):
        $(document.body).append($("<img>", {src: browser.extension.getURL("themes/images/custom/モザイク.svg")}));
        break;
      */
}

browser.storage.sync.get((u ? ["preferenceNotifications", "preferenceStifleTags", "welcomedOn"] : []).concat("preferenceDoubleEn")).then((e, error) => {
    if (!error) {
        let manifest = browser.runtime.getManifest();
        if (e.preferenceNotifications !== false) {
            AJAX.then((resolve, reject) => {
                var alertCheck;
                $(".header-alerts-container").parent().hide();
                alertCheck = function() {
                    $.get(href("/alerts"), data => {
                        if (data) {
                            data = JSON.parse(data);
                            if (data && data.length) {
                                var n = {
                                        messages: {
                                            selector: "li a[href='/my/messages']",
                                            value: 0
                                        },
                                        notifications: {
                                            selector: "li a[href='/My/Notifications']",
                                            value: 0
                                        }
                                    },
                                    notifications = 0;
                                data.forEach(i => {
                                    if ((i.type || null) === "newmessage") n.messages.value = parseInt(i.message.match(/\d[\d,]*/)[0].replace(/,/g, ""));
                                    else if ((i.type || null) === "notification" && (!e.preferenceStifleTags || !/tagged/.test(i.message))) n.notifications.value++;
                                });
                                for (var i in n) {
                                    i = n[i];
                                    if (i.value) $(i.selector).attr("data-badge", i.value);
                                    notifications += i.value;
                                }
                                if (notifications) return $("li a[href='/my/']").attr("data-badge", "!");
                            }
                        }
                        if (resolve) setTimeout(alertCheck, 15000);
                    });
                }
                alertCheck();
            });
        }
        if (e.welcomedOn != null) {}
        else if (e.welcomedOn !== manifest.version) {/*
            $("#CYS-Theme").before($("<link>", {
              type: "text/css",
              rel: "stylesheet",
              href: "/Resources/jQuery/jquery-ui-1.10.3/smoothness/jquery-ui.min.css"
            }));
            $("<div></div>", {
                title: `Welcome to ${manifest.name} ${manifest.version}!`
            }).append($(`
              <p>Hello, ${$("#Cys_DisplayName").text()}, and welcome to ${manifest.name} ${manifest.version}!</p>
              <p>While the original theme is enabled by default, ${manifest.name} provides alternate dark and light themes that can be enabled from your <a href="/My/Profile.aspx">profile preferences</a>.</p>
            `)).dialog({
                modal: true,
                resizable: false,
                closeText: ""
            });
        */}
        if (e.preferenceDoubleEn) $("*").contents().filter(function() {
            return (this.nodeType == 3 && !["SCRIPT", "STYLE"].includes(this.parentNode.nodeName) && $.trim(this.nodeValue) && /\bm\x69\x7a(\b|\x61\x6c)/.test(this.data))
        }).each(function() {
            var div = $("<div></div>"),
                node = $(this);
            div.html(node.text().replace(/\bm\x69\x7a(\b|\x61\x6c)/g, atob("TWl6YWw")));
            node.before(div.contents()).remove();
        });
    }
});

$("body").on("click", "x-spoiler", function() {
    let e = $(this);
    e.attr("data-open", e.attr("data-open") == null ? "" : null);
});
