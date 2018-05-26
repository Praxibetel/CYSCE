chrome.storage.sync.get("preferenceNotifications", (e) => {
    if (!chrome.runtime.lastError && !e.preferenceNotifications) {
        $(".header-alerts-container").parent().hide();
    }
});

$.get("/alerts", (data) => {
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
            data.forEach((i) => {
                if ((i.type || null) === "newmessage") n.messages.value = parseInt(i.message.match(/\d[\d,]*/)[0].replace(/,/g, ""));
                else if ((i.type || null) === "notification") n.notifications.value++;
            });
            for (var i in n) {
                i = n[i];
                if (i.value) $(i.selector).attr("data-badge", i.value);
                notifications += i.value;
            }
            if (notifications) $("li a[href='/my/']").attr("data-badge", "!");
        }
    }
})
