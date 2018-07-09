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

if (!$("script:contains('CKEDITOR.replace')").length) chrome.storage.sync.get("preferenceCodeMirror", (e) => {
    if (!chrome.runtime.lastError && e.preferenceCodeMirror !== false) {
        var profileMirror = CodeMirror.fromTextArea(document.getElementById("Profile"), {
            autoCloseTags: {
                whenOpening: true,
                whenClosing: true,
                indentTags: ["applet", "blockquote", "body", "div", "dl", "fieldset", "form", "frameset", "head", "html", "layer", "legend", "object", "ol", "script", "select", "style", "table", "ul"]
            },
            mode: "htmlmixed"
        });

        $("form").submit(function() {
            $("#Profile").val(profileMirror.getValue());
        });

        $(window).on("load", function() {
            profileMirror.refresh();
        });
    }
});

$("input[name='Birthdate']").attr("type", "hidden").after($("<input>", {
    type: "date"
}).val(function() {
    var date = new Date($("input[name='Birthdate']").val());
    return isNaN(date) ? "" : `${date.getUTCFullYear()}-${("00" + (date.getUTCMonth() + 1)).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)}`;
}).on("change", function() {
    var date = new Date(this.value);
    $("input[name='Birthdate']").val(isNaN(date) ? "" : `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`);
}))
