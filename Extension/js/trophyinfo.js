$("tr:contains('2,000')").after($("<tr></tr>").append(
    $("<td></td>").append($("<img>", {
        src: "images/trophies/5000points.gif"
    })),
    $("<td></td>").append(
        $("<strong></strong>").append(
            "5,000 Point Trophy",
            $("<br>")
        ),
        "Earned when a member has 5,000 or more points"
    )
));

$("tr:contains('Top Rater')").after($("<tr></tr>").append(
    $("<td></td>").append($("<img>", {
        src: "images/trophies/CommunityContributor.gif"
    })),
    $("<td></td>").append(
        $("<strong></strong>").append(
            "Community Contributor Trophy",
            $("<br>")
        ),
        "Given to members who have rewarded the community with incredible contributions."
    )
));
