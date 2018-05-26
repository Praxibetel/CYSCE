chrome.storage.sync.get(null, (e) => {
    if (!chrome.runtime.lastError) {
        $.get(chrome.extension.getURL("preferences.html"), (data) => {
            $("form > table > tbody > tr:nth-child(22)").after(
                $(data)
                .find("input[type='checkbox']").each(function() {
                    if (this.dataset.key) {
                        var t = e[this.dataset.key];
                        if (t === true || t === false) this.checked = t;

                    }
                }).end()
            );
        });
        $("form").on("click", ".CYSExtension", function() {
            if (this.dataset.key) {
                var preferences = {};
                preferences[this.dataset.key] = this.checked;
                chrome.storage.sync.set(preferences);
            }
        });
    }
});
