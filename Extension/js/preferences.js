var profileMirror,
    que = ["c2VjcmV0", "bW90aGVyb2Zjb2luczY5", "cGFzc3dvcmQ", "c3B1bmdsZW11bmR5", "V0hJUG1laGFyZGVy", "c3RyYXdiZXJyeXNwb3Jr", "TW9vc2VwYXN0ZQ", "SW1wb3NzaWJsZXRvZm9yZ2V0cGFzc3dvcmQ3", "Q29ycmVjdEhvcnNlQmF0dGVyeVN0YXBsZQ", "QnJocnN3ZnBicA"];

browser.storage.sync.get(null).then((e, error) => {
    if (!error) {
        $.get(browser.extension.getURL("html/preferences.html"), data => {
            $("form > table > tbody > tr:nth-child(22)").after(
                $(data)
                .find("input[type='checkbox']").each(function() {
                    if (this.dataset.key) {
                        var t = e[this.dataset.key];
                        switch (this.id) {
                          case "CYSExtensionWelcomedOn":
                              console.log("welcomedOn", t);
                              this.checked = !t;
                              break;
                          case "CYSExtensionDoubleEn":
                              $("#m").text(t ? "M" : "m");
                              // don't break;
                          default:
                              if (t === true || t === false) this.checked = t;
                        }
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
            $(`.CYSExtension[data-parent]`).each(function() {
                if (!this.dataset.parent || !this.dataset.parentValues) return;
                let p = $(`#${this.dataset.parent}`);
                if (!p.length) return;
                this.disabled = !this.dataset.parentValues.trim().split(/\s+/).includes("" + p.val());
            });
            if (new RegExp(`[?&](${que.map(q => atob(q)).join("|")})`, "i").test(new URL(document.location).search)) $(".CYSExtensionHidden").show(), $("#m").text(e.preferenceDoubleEn ? "M" : "m");
        });
        $("form").on("click", ".CYSExtension[type='checkbox']", function() {
            var e = this;
            if (e.dataset.key) {
                var preferences = {};
                switch (e.id) {
                  case "CYSExtensionWelcomedOn":
                      preferences[e.dataset.key] = e.checked ? null : browser.runtime.getManifest().version;
                      break;
                  case "CYSExtensionThemelessMenus":
                      $(".sidebar-content").toggleClass("expand-all", !e.checked);
                      preferences[e.dataset.key] = e.checked;
                      break;
                  case "CYSExtensionDoubleEn":
                      $("#m").text(e.checked ? "M" : "m");
                      // don't break;
                  default:
                      preferences[e.dataset.key] = e.checked;
                }
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
                            }).then(response => {
                                if (!$("style#CYS-Theme").length) $("head").append($("<style></style>", {
                                  id: "CYS-Theme"
                                }));
                                $("style#CYS-Theme").text(response.theme || "");
                            });
                            break;
                        case "CYSExtensionMasthead":
                            browser.runtime.sendMessage({
                                action: "CYSupdateMasthead",
                                masthead: e.value
                            }).then((response) => {
                                $(document.documentElement).removeClass(function() {
                                    return Array.from(this.classList).filter(c => c.startsWith("CYSCE-")).join(" ");
                                });
                                if (response.masthead) $(document.documentElement).addClass(response.masthead)});
                            break;
                        case "CYSExtensionViewerTheme":
                        case "CYSExtensionViewerSerifs":
                        case "CYSExtensionViewerCPL":
                        case "CYSExtensionViewerDestyle":
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
                $(`.CYSExtension[data-parent="${e.id}"]`).each(function() {
                    if (!this.dataset.parentValues) return;
                    this.disabled = !this.dataset.parentValues.trim().split(/\s+/).includes("" + e.value);
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
}));
