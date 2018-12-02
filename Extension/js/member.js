var username = $("h1:first-child > span").text().trim();

if ($("meta[itemprop='doctitle']").length) $("title").text($("meta[itemprop='doctitle']").attr("content"));
else $("title").text(`${username} > ChooseYourStory.com`);

$("#profile_Sidebar h2:contains('Commendations') + div").after(
    $("<h2></h2>").text("Worth"),
    (() => {
        var active, commendations, contributor, featured, joined, lucky, points, posts, storygames, trophies, years;
        joined = new Date($("#profile_Sidebar h2:contains('Member Since') + div").text());
        if (!(joined instanceof Date && !isNaN(joined))) {
            joined = new Date("1/1/2001");
        }
        active = new Date($("#profile_Sidebar h2:contains('Last Activity') + div").text());
        if (!(active instanceof Date && !isNaN(active))) {
            active = new Date("1/1/2001");
        }
        years = (active - joined) / 31556952000;
        if (years < 1) {
            years = 1;
        }
        points = parseInt($("#profile_Sidebar h2:contains('EXP Points') + div").text().replace(/,/g, "") || 0);
        if (isNaN(points)) {
            points = /infinit[ey]/i.test($("#profile_Sidebar h2:contains('EXP Points') + div").text()) ? 2e308 : 0;
        }
        posts = parseInt($("#profile_Sidebar h2:contains('Post Count') + div").text().replace(/,/g, "") || 0);
        storygames = parseInt($("#profile_Sidebar h2:contains('Storygame Count') + div").text().replace(/,/g, "") || 0);
        commendations = parseInt($("#profile_Sidebar h2:contains('Commendations') + div").text().replace(/,/g, "") || 0);
        trophies = $("#profile_Trophies img").length;
        contributor = $("#profile_Trophies img[src$='CommunityContributor.gif']").length !== 0;
        lucky = $("#profile_Trophies img[src$='luckyDueler.gif']").length !== 0;
        featured = $("#profile_Stories img[alt='Featured Story']").length;
        return $("<div></div>").text(((years * points / 1000 * posts / 1000 * (storygames + featured) + commendations + trophies) * (contributor ? 5 : 1) * (lucky ? 2 : 1)).toFixed(2));
    })()
);

$("#profile_Stories > div > span").each(function() {
    var e = $(this);
    e.wrap($("<a></a>", {
        href: `../story/${encodeURIComponent(e.text()).replace(/[-_.~"]/g, (c) => `%${c.charCodeAt(0).toString(16)}`).replace(/%/g, "~").toLowerCase()}`
    }));
}).addClass("unpublished");

dynamicizeForumPosts("#profile_Posts > div");
