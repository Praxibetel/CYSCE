var e,
    u = !!$("#Cys_DisplayName").length,
    url = new URL(document.location);

$("link[rel='icon']").replaceWith($("<link>", {
    rel: "icon",
    type: "image/png",
    href: chrome.extension.getURL("cysicon-16.png"),
    sizes: "16x16"
}).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: chrome.extension.getURL("cysicon-19.png"),
    sizes: "19x19"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: chrome.extension.getURL("cysicon-24.png"),
    sizes: "24x24"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: chrome.extension.getURL("cysicon-32.png"),
    sizes: "32x32"
})).add($("<link>", {
    rel: "icon",
    type: "image/png",
    href: chrome.extension.getURL("cysicon-38.png"),
    sizes: "38x38"
})));

e = $(".sidebar-content > ul > li > a[href='/Stories/']");
if (!e.parent().find("ul").length) e.after('<ul id="ctl13"><li id="ctl14"><a id="ctl15" href="/stories/random">Random</a></li><li id="ctl16"><a id="ctl17" href="/Games/Search.aspx">Search</a></li></ul>');
e = $(".sidebar-content > ul > li > a[href='/forums']");
if (!e.parent().find("ul").length) e.after('<ul id="ctl104"><li id="ctl105"><a id="ctl106" href="/Forums/Search.aspx">Search</a></li></ul>');
e = $(".sidebar-content > ul > li > a[href='/my/']");
if (u && !e.parent().find("ul").length) e.after('<ul id="ctl25"><li id="ctl26"><a id="ctl27" href="/My/Games.aspx">Storygames</a></li><li id="ctl28"><a id="ctl29" href="/My/Pictures/Default.aspx">Pictures</a></li><li id="ctl30"><a id="ctl31" href="/my/messages">Messages</a></li><li id="ctl32"><a id="ctl33" href="/My/Notifications">Notifications</a></li><li id="ctl34"><a id="ctl35" href="/My/Duels/Default.aspx">Duels</a></li><li id="ctl36"><a id="ctl37" href="/My/Saves.aspx">Saves</a></li><li id="ctl38"><a id="ctl39" href="/My/Comments.aspx">Comments</a></li><li id="ctl40"><a id="ctl41" href="/My/Points.aspx">Points</a></li><li id="ctl42"><a id="ctl43" href="/user/endorsements?username=' + $("#Cys_DisplayName").text() + '">Commendations</a></li><li id="ctl44"><a id="ctl45" href="/my/notepad">Notepad</a></li><li id="ctl46"><a id="ctl47" href="/My/Profile.aspx">Profile</a></li></ul>');
e = $(".sidebar-content > ul > li > a[href='/help/']");
if (!e.parent().find("ul").length) e.after('<ul id="ctl50"><li id="ctl51"><a id="ctl52" href="/Help/History.aspx">CYOA History</a></li><li id="ctl53"><a id="ctl54" href="/Help/AboutUs.aspx">About Us</a></li><li id="ctl55"><a id="ctl56" href="/Help/PrivacyPolicy.aspx">Privacy Policy</a></li><li id="ctl57"><a id="ctl58" href="/Help/TermsOfService.aspx">Terms Of Service</a></li></ul>');
if (!u) $(".sidebar-content > ul > li > a[href='/Logon.aspx']").after('<ul><li><a href="/newuser.aspx">Register</a></li></ul>');

if (url.pathname.endsWith("article.aspx")) {
    $("title").text(`${$("#maincontent > h1:first-child").text().trim()} > Help & Info > ChooseYourStory.com`)
    $(document.body).append($("<link>", {
        rel: "stylesheet",
        type: "text/css",
        href: chrome.extension.getURL("themes/print.css")
    }));
    $(".tertiaryButton").parent().replaceWith(function() {
        return $("<ul></ul>", {
            class: "help-info-selector"
        }).append($(this).find(".tertiaryButton"));
    });
}

switch (url.pathname) {
    case "/endorsements":
        $("title").text(`Commendations > All ${url.searchParams.get("sect")}s > ChooseYourStory.com`);
        break;
    case "/user/endorsements":
        $("title").text(`Commendations > ${url.searchParams.get("username")} > ChooseYourStory.com`);
        break;
    case "/user/points":
        $("title").text(`Experience Points > ${url.searchParams.get("username")} > ChooseYourStory.com`);
        break;
    case "/secret/cysid/set-render-mode":
        $("title").text("Abandon all hope, ye who enter here > ChooseYourStory.com");
        break;
    case "/Forums/Search.aspx":
        $("title").text("Just Google it > ChooseYourStory.com");
        var upDate1 = function() {
                var date = new Date($(`input[name="${$(this).data("for")}"]`).val());
                console.log(date);
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
}

if (u) chrome.storage.sync.get(["preferenceNotifications", "preferenceStifleTags"], e => {
    if (!chrome.runtime.lastError && e.preferenceNotifications !== false) {
        AJAX.then((resolve, reject) => {
            var alertCheck;
            $(".header-alerts-container").parent().hide();
            alertCheck = function() {
                $.get("/alerts", data => {
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
});

$("body").on("click", "x-spoiler", function() {
    let e = $(this);
    e.attr("data-open", e.attr("data-open") == null ? "" : null);
});
