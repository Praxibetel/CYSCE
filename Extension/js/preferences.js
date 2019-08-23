var profileMirror;

browser.storage.sync.get(null).then((e, error) => {
    if (!error) {
        //console.log(e);
        $.get(browser.extension.getURL("html/preferences.html"), data => {
            $("form > table > tbody > tr:nth-child(22)").after(
                $(data)
                .find("input[type='checkbox']").each(function() {
                    if (this.dataset.key) {
                        var t = e[this.dataset.key];
                        if (t === true || t === false) this.checked = t;

                    }
                }).end()
                .find("input[type='radio']").each(function() {
                    if (this.dataset.key) this.checked = e[this.dataset.key] === this.value;
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
                browser.storage.sync.set(preferences);
                browser.runtime.sendMessage({
                    action: "CYSupdatePreference",
                    key: e.dataset.key,
                    value: e.checked
                });
            }
        });
        $("form").on("click", ".CYSExtension[type='radio']", function() {
            var e = this;
            if (e.dataset.key) {
                var preferences = {};
                preferences[e.dataset.key] = e.value;
                browser.storage.sync.set(preferences);
                browser.runtime.sendMessage({
                    action: "CYSupdatePreference",
                    key: e.dataset.key,
                    value: e.value
                });
            }
        });
        $("form").on("change", ".CYSExtension:not([type='checkbox'])", function() {
            var e = this;
            if (e.dataset.key) {
                var preferences = {};
                preferences[e.dataset.key] = e.value;
                browser.storage.sync.set(preferences).then(() => {
                    switch (e.id) {
                        case "CYSExtensionTheme":
                            browser.runtime.sendMessage({
                                action: "CYSupdateTheme"
                            }).then(response => $("style#CYS-Theme").text(response.theme || ""));
                            break;
                        case "CYSExtensionViewerTheme":
                            browser.runtime.sendMessage({
                                action: "CYSupdateViewerTheme"
                            });
                            break;
                        case "CYSExtensionCodeMirrorTheme":
                            profileMirror.setOption("theme", e.value);
                            break;
                        default:
                            break;
                    }
                });
            }
        });
    }
});

if (!$("script:contains('CKEDITOR.replace')").length) browser.storage.sync.get("preferenceCodeMirror").then((e, error) => {
    if (!error && e.preferenceCodeMirror !== false) {
        profileMirror = CodeMirror.fromTextArea(document.getElementById("Profile"), CMHTML);

        if (CMAutobreak) profileMirror.setValue(CMUnPreLine(profileMirror.getValue()));

        $("form").submit(function() {
            $("#Profile").val(CMAutobreak ? CMPreLine(profileMirror.getValue()) : profileMirror.getValue());
        });

        $(window).on("load", function() {
            profileMirror.refresh();
        });
    }
});

$("select[name='Avatar Image ID']").change(function() {
    var val = $(this).val();
    $("#CYSExtensionAvatarPreview").attr("src", val !== "none" ? `/i?${val}` : "");
}).parent().parent().next().find(".smallerText").prepend($("<img>", {
    id: "CYSExtensionAvatarPreview",
    src: $("select[name='Avatar Image ID']").val() !== "none" ? `/i?${$("select[name='Avatar Image ID']").val()}` : ""
}));

$("input[name='Birthdate']").attr("type", "hidden").after($("<input>", {
    type: "date"
}).val(function() {
    var date = new Date($("input[name='Birthdate']").val());
    return isNaN(date) ? "" : `${date.getUTCFullYear()}-${("00" + (date.getUTCMonth() + 1)).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)}`;
}).on("change", function() {
    var date = new Date(this.value);
    $("input[name='Birthdate']").val(isNaN(date) ? "" : `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`);
}))
