var e,
    u = !!$("#Cys_DisplayName").length,
    url = new URL(document.location);

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
