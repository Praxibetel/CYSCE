var username = $("h1:first-child > span").text().trim();

if ($("meta[itemprop='doctitle']").length) $("title").text($("meta[itemprop='doctitle']").attr("content"));
else $("title").text(`${username} > ChooseYourStory.com`);

$("#profile_Sidebar").prepend(
    $("<div></div>").text($(".footer-content a").filter(function() {
        return this.textContent === username;
    }).length ? "Online" : "Offline")
);

$("#profile_Sidebar h2:contains('Commendations') + div").after(
    $("<h2></h2>").text("Worth"),
    (() => {
        var active, articles, commendations, contributor, featured, joined, points, posts, storygames, trophies, years;
        joined = new Date($("#profile_Sidebar h2:contains('Member Since') + div").text());
        if (!(joined instanceof Date && !isNaN(joined))) {
            joined = new Date("1/1/2001");
        }
        active = new Date($("#profile_Sidebar h2:contains('Last Activity') + div").text());
        if (!(active instanceof Date && !isNaN(active))) {
            active = new Date("1/1/2001");
        }
        years = (active - joined) / 31556952000;
        points = parseInt($("#profile_Sidebar h2:contains('EXP Points') + div").text().replace(/,/g, "") || 0);
        if (isNaN(points)) {
            points = /infinit[ey]/i.test($("#profile_Sidebar h2:contains('EXP Points') + div").text()) ? Infinity : 0;
        }
        posts = parseInt($("#profile_Sidebar h2:contains('Post Count') + div").text().replace(/,/g, "") || 0);
        storygames = parseInt($("#profile_Sidebar h2:contains('Storygame Count') + div").text().replace(/,/g, "") || 0);
        commendations = parseInt($("#profile_Sidebar h2:contains('Commendations') + div").text().replace(/,/g, "") || 0);
        trophies = $("#profile_Trophies img").filter(function() {
            return /\/(from.*?|contestWinner|luckyDueler|bugHunter|(top|supreme)Rater)\.gif$/i.test(this.src);
        }).length;
        contributor = $("#profile_Trophies img[src$='CommunityContributor.gif']").length;
        featured = $("#profile_Stories img[alt='Featured Story']").length;
        articles = $("#profile_Articles div").length;
        storygames -= featured;
        return $("<div></div>").text((100 * [
            [0.27, (storygames + 6 * featured) / 10],
            [0.20, Math.log2((points / 3000) + 1)],
            [0.20, Math.log2((commendations / 200) + 1)],
            [0.12, Math.log2((posts / 1000) + 1)],
            [0.11, trophies / 8],
            [0.05, articles],
            [0.05, contributor]
        ].map(x => x.reduce((a, b) => a * b)).reduce((a, b) => a + b) * (years / 3) ** 0.22).toFixed(2).replace("Infinity", "infinite"));
    })()
);

$("#profile_Stories > div > span").each(function() {
    var e = $(this);
    e.wrap($("<a></a>", {
        href: `../story/${encodeURIComponent(e.text()).replace(/[-_.~"]/g, (c) => `%${c.charCodeAt(0).toString(16)}`).replace(/%/g, "~").toLowerCase()}`
    }));
}).addClass("unpublished");

dynamicizeForumPosts("#profile_Posts > div");
