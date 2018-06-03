chrome.storage.sync.get(null, (e) => {
    if (!chrome.runtime.lastError) {
        console.log(e);
        $.get(chrome.extension.getURL("html/preferences.html"), (data) => {
            $("form > table > tbody > tr:nth-child(22)").after(
                $(data)
                .find("input[type='checkbox']").each(function() {
                    if (this.dataset.key) {
                        var t = e[this.dataset.key];
                        if (t === true || t === false) this.checked = t;

                    }
                }).end()
                .find("select").each(function() {
                    if (this.dataset.key) {
                        var s = $(this).find("option"),
                            t = e[this.dataset.key];
                        if (s.map(function() {
                                return this.value;
                            }).get().includes(t)) s.prop("selected", false), s.filter(function() {
                            return this.value === t;
                        }).prop("selected", true);

                    }
                }).end()
            );
        });
        $("form").on("click", ".CYSExtension[type='checkbox']", function() {
            var e = this;
            if (e.dataset.key) {
                var preferences = {};
                preferences[e.dataset.key] = e.checked;
                chrome.storage.sync.set(preferences);
            }
        });
        $("form").on("change", ".CYSExtension:not([type='checkbox'])", function() {
            var e = this;
            if (e.dataset.key) {
                var preferences = {};
                preferences[e.dataset.key] = e.value;
                chrome.storage.sync.set(preferences, () => {
                    if (e.id === "CYSExtensionTheme") chrome.runtime.sendMessage({
                        action: "CYSupdateTheme"
                    }, (response) => {
                      console.log(response);
                        $("style#CYS-Theme").text(response.theme || "")
                    });
                });
            }
        });
    }
});
