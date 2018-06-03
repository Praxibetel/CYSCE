/// <reference path="/Resources/Scripts/jquery-1.7-vsdoc.js" />
(function ($) {
    var PAGE_SIZE = 25;

    var ListingHash = function (hash) {
        hash = hash || window.location.hash;

        this.page = 1;
        this.sort = 'recommended',
        this.rating = 5;
        this.myrating = 0;
        this.isDefault = function () {
            return this.toString() == '';
        };
        this.toString = function () {
            var s = '';
            if (this.page != 1) s += '&page=' + this.page;
            if (this.sort != 'recommended') s += '&sort=' + this.sort;
            if (this.rating != 5) s += '&rating=' + this.rating;
            if (this.myrating != 0) s+= '&myrating=' + this.myrating;
            return s.substring(1);
        };

        var h = window.location.hash.substring(1).split('&');
        for (var i = 0; i < h.length; i++) {
            var p = h[i].split('=');
            if (p.length != 2) continue;
            this[p[0]] = p[1];
            if (p[0] != 'sort') p[1] = parseInt(p[1], 10);

        }
    };

    var createSummary = function (story) {

        var $icon = $('<div class="icon" />')
            .append($('<img src="/Resources/Images/Icons/Iconshock/56x56/badge-01.png" title="Featured Storygame" alt="Featured" />'));
        if (!story.featured) $icon = '';

        var $heading = $('<div class="heading" />')
            .append($('<h2 />')
                .append($('<a />').attr('href',story.url).text(story.title))
            )
            .append($('<div />')
                .html('&nbsp; by ')
                .append($('<a />')
                    .attr('href', '/member/' + escape(story.username) + '.aspx')
                    .text(story.username))
            );

        var $subheading = $('<div class="subheading" />').text(story.desc);

        var $stats = $('<div class="stats" />')
            .append($('<div class="stat" />')
                .append($('<div class="storygame-player-rating" />')
                    .append($('<div class="inner" />').width(story.rating * 16))
                    .append($('<div class="my" />').css('left', story.myrating * 16 - 16))
                )
                .append('(' + story.ratings + ' ratings)')
            )
            .append($('<div class="stat" />').text('Published: ' + (new Date(story.published)).toLocaleDateString()))
            .append($('<div class="stat" />').text('Difficulty: ' + story.difficulty + '/8'))
            .append($('<div class="stat" />').text('Length: ' + story.length + '/8'))
        ;
        var $tags = $('<div class="storygame-tags-list" />');
        for (var i = 0; i < story.tags.length; i++) {
            var tag = story.tags[i];
            $tags.append($('<a class="button" />')
                .attr('href', '/stories/' + escape(tag))
                .append('<img alt="" src="/0x44/InedoLib/Inedo.Web.Controls.IconImage/ProcessImageRequest/InedoIcons/F3Silk/16x16/tag_green.png" />')
                .append(tag)
            )
        }
        return $('<div/>')
            .addClass('storygame-summary')
            .data('story', story)
            .append($icon,$heading,$subheading,$stats,$tags)
        ;
    };

    var createfilter = function (filtered, total, resetStories) {

        var _hash = (new ListingHash());
        var ddlSort = $('<select />')
            .append(
                $('<option>Recommended order</option>').val('recommended'),
                $('<option>Newest</option>').val('published'),
                $('<option>By rating</option>').val('rating'),
                $('<option>By rating (reverse)</option>').val('rating-desc'),
                $('<option>By length</option>').val('length'),
                $('<option>By length (reverse)</option>').val('length-desc'),
                $('<option>By difficulty</option>').val('difficulty'),
                $('<option>By difficulty (reverse)</option>').val('difficulty-desc')
            )
            .val(_hash.sort)
            .change(function () {
                var hash = new ListingHash();
                hash.sort = $(this).val();
                window.location = '#' + hash;
                resetStories();
            });

        var ddlRating = $('<select />')
            .append(
                $('<option>0 - Not Yet Rated</option>').val(0),
                $('<option>1 - stay away. far, far away</option>').val(1),
                $('<option>2 - good ... for you to poop on</option>').val(2),
                $('<option>3 - choose your own boredom</option>').val(3),
                $('<option>4 - slightly more fun than homework</option>').val(4),
                $('<option>5 - not the best, certainly not the worst</option>').val(5),
                $('<option>6 - it\'s worth every cent</option>').val(6),
                $('<option>7 - even better than Reeses\' Cups®</option>').val(7),
                $('<option>8 - it will bring you enlightenment</option>').val(8)
            )
            .val(_hash.rating)
            .change(function () {
                var hash = new ListingHash();
                hash.rating = $(this).val();
                window.location = '#' + hash;
                resetStories();
            });

        var ddlMyRating = $('<select />')
                .append(
                    $('<option>Rated and Not Rated</option>').val(0),
                    $('<option>Unrated Only</option>').val(1),
                    $('<option>Rated Only</option>').val(2)
                )
                .val(_hash.myrating)
                .change(function () {
                    var hash = new ListingHash();
                    hash.myrating = $(this).val();
                    window.location = '#' + hash;
                    resetStories();
                });

        var $controls = $('<div class="controls" />')
            .append('Sorted by:', ddlSort)
            .append(' Minimum Rating:', ddlRating)
            .append(' Include:', ddlMyRating);

        if ((new ListingHash().isDefault())){
            $controls.hide();
        }

        return $('<div class="storygames-filter" />')
            .append("Showing ", filtered, " stories", ((filtered == total) ? "" : " of " + total))
            .append($('<a href="#" class="toggle">filter / sort</a>').click(function () { $controls.slideToggle(); return false; }))
            .append($controls)
        ;
    };

    var createPager = function (dataLength, resetStories) {
        var $ul = $('<ul class="page-number-list" />');
        {
            var hash = new ListingHash();

            for (var i = 0; i < dataLength / PAGE_SIZE; i++) {
                hash.page = i + 1;
                var $a = $('<a />')
                    .text(hash.page)
                    .attr('href', '#' + hash)
                    .click(function () {
                        window.location = this.href;
                        resetStories();
                        return false;
                    });
                $ul.append($('<li />').append($a));
            }
        };
        return $ul;
    };

    var fillStories = function ($stories, data) {

        var hash = new ListingHash();
        var pagesize = PAGE_SIZE;
        var numpages = Math.ceil(data.length / pagesize);

        var from = pagesize * (hash.page - 1)
        var to = data.length - (pagesize * (numpages - hash.page));
        to = Math.min(pagesize + from, data.length);

        //alert(data.length + '-'+'('+pagesize+'* (' +numpages+' - '+hash.page+'))');

        $stories.html('');
        for (var i = from; i < to; i++)
            $stories.append(createSummary(data[i]));
    };

    $.fn.cys_storylisting = function (updateUrl) {

        if (!$) { alert('Error: JQuery library not loaded; cannot add cys_storylisting plugin.'); return false; }

        var $this = $(this);

        var $stories = $('<div>Loading...</div>');
        var $pager = $('<ul />');
        var $filter = $('<div />')

        $.post(updateUrl).success(function (data) {

            var resetStories = function (nofade) {
                if (!nofade) $stories.fadeOut();
                var hash = new ListingHash();

                var filtereddata = data
                    .filter(function (a) {
                        return a.rating >= hash.rating
                            && (hash.myrating == 0 ||
                                (hash.myrating == 1 && !a.myrating) ||
                                (hash.myrating == 2 && a.myrating));
                    }).sort(function (a, b) {
                        switch (hash.sort) {
                            case 'recommended': return 0;

                            case 'publishdate':
                                var _a = new Date(a[hash.sort]); var _b = new Date(b[hash.sort]);
                                break;
                            case 'rating':
                            case 'length':
                            case 'difficulty':
                                var _b = a[hash.sort]; var _a = b[hash.sort];
                                break;
                            case 'rating-desc':
                            case 'length-desc':
                            case 'difficult-desc':
                                var p = hash.sort.substring(0, hash.sort.length - 5);
                                var _a = a[p]; var _b = b[p];
                                break;
                            default: return 0;
                        }

                        if (_a < _b) return -1;
                        else if (_a > _b) return 1;
                        else return 0;
                    });

                fillStories($stories, filtereddata);
                $pager.html(createPager(filtereddata.length, resetStories));
                $filter.html(createfilter(filtereddata.length, data.length, resetStories));


                if (!nofade) $stories.fadeIn();
            };
            resetStories(true);
        });

        $this.append($filter);
        $this.append($stories);
        $this.append($pager);


    };
})(jQuery);













/*

            InedoLib.Util.JavaScript.WriteJson(context.Response.Output, data
                .MAG_Games_Extended.Take(100).Select(g => new {
                    id = g.Game_Id,
                    title = g.Title,
                    username = g.Username,
                    url = StoryOverviewPage.BuildUrlFromTitle(g.Title),
                    desc = g.Short_Description,
                    length = g.Length,
                    published = g.Date_Published,
                    featured = g.Date_Category_Featured.HasValue,
                    difficulty = g.Difficulty_Level_Id,
                    ratings = g.Rating_Count,
                    rating = g.Calculated_Rating,
                    tags = data.Story_Tags.Where(st => st.Story_Id == g.Game_Id).Select(st => st.Tag),
                    myrating = data.MAG_Game_Ratings.Where(gr => gr.Game_ID == g.Game_Id).Select(gr => gr.Rating).FirstOrDefault()
                }));


    /// <summary>Handles manipulation for BuildMaster application deployment plans.</summary>
    /// <param name="o" value="{
    ///     applicationId: 0,
    ///     getPlanUrl: '',
    ///     getActionUrl: '',
    ///     getActionGroupUrl: '',
    ///     showDeployables: false,
    ///     createActionGroupUrl: '',
    ///     copyActionUrl: '',
    ///     addLinks: [{text:'', url:''}],
    ///     editActionGroupLinks: [{text:'', url:''}],
    ///     environments: [{id:0, name:'', canEdit:false}]
    /// }">Input argumemts.</param>

*/
