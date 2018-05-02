// scripts.js

var portal = {

    loginInit: function() {
        //add placeholder for IE8 and IE9
        $('input, textarea').placeholder();

        // change order of forgot password and submit button.
        $('.submit-forgot-password').appendTo('.form-submit');
    },

    memberInit: function() {
        $('.member .btn-submit a').click(function () {
            if ($(this).hasClass('disabled')) {
              return false;
            } else {
              return true;
            }
        });
    },

    buttonDisabled: function () {
        $('.btn-next .disabled, .btn-prev .disabled').click(function () {
            return false;
        });
    },

    hideCloseDate: function() {
        if ($(".stdLstNoDataLbl").length > 0) {
            $(".label-closedate").css("display","none");
        }
    },

    setHeights: function() {
         $('body, html').css('overflow', 'hidden');
            var maxHeight = -1;
            var viewportWidth = $(window).width();
            $('body, html').css('overflow', 'visible');
        /* Replace the 4 lines above with the following code, if the calculation fails to work properly
            $('body, html').css('overflow', 'hidden');
            var maxHeight = -1;
            var viewport = $(window).width();
            $('body, html').css('overflow', 'visible');
        */
       
        $('.content-heights > div').css('height', 'auto');

        if (viewportWidth >= 701) {
            $('.content-heights > div').each(function() {
                maxHeight = maxHeight > $(this).outerHeight() ? maxHeight : $(this).outerHeight();
            });

            $('.content-heights > div').each(function() {
                $(this).css('height', maxHeight);
            });
        } else {
            $('.content-heights > div').each(function() {
                $(this).css('height', 'auto');
            });
        }
    },

    /* "elements" should be replaced by a class that is the same on all your widgets
       "element1" and "element2", etc, should be replaced by a unique ID or class for each widget */
    setWidgetHeights: function() {
        $('.elements').height("auto");
        var highestCol = Math.max($('#element1').outerHeight(),$('#element2').outerHeight());
        $('.elements').height(highestCol);
    },

    formClasses: function() {
        $('.form-input').addClass('form-group');
        $('.form-checkbox').addClass('checkbox');
        $('.form-checkbox input').prependTo('.form-checkbox label');
    },

    formatProfile: function() {
        if ($(".wid-profile").length > 0) {
            var labelWidth = $(".wid-profile .form-input .input-text").width();
            $(".wid-profile p.msg").slice(1).css('padding-left', labelWidth + 'px').addClass("message");
            //$(".wid-profile p.msg").slice(1).css('color','#999999');
        }
    },

    bodyClass: function() {
      // adds member / login class to body based on location
        Array.prototype.contains = function ( needle ) {
           for (i in this) {
               if (this[i] == needle) return true;
           }
           return false;
        }
        var pathArray = window.location.pathname.split( '/' );

        if (pathArray.contains('members')) {
            $('body').addClass('member');
            portal.memberInit();
        } else if (pathArray.contains(!'members')) {
            $('body').addClass('login');
            portal.loginInit();
        }
    },

    errorModal: function() {      
        /* if the error message is being displayed,
           move it into the modal window and trigger modal */
      
        if ( $('.errMsg').length > 0 ) {             
            var errorMsg = $('.errMsg').text();
            $('#errorModal').modal('show');
            $('.errMsg').hide();
            $('#errorModal .modal-body p').text(errorMsg);
        }
    },

    removeSurveyNumbering: function () {
        var el = $(".survey .item-header, .studies-list-full .item-header");
        $.each(el, function (index, item) {
            var dotindex = $(item).html().toLowerCase().indexOf(".");
            var newhtml = $(item).html().substring(dotindex+1);
            $(item).html(newhtml);
        })   
    },

    /* 
        adds numbers in front of the links in the newsletter list
        if you don't have the view-all button in your ul, get rid
        of the if statement and just have the text inside it by
        itself
    */
    addNewsletterNumbering: function() {
        $(".newsletters ul li a").each(function(ctr) {
            ctr = ctr+1;

            var li_text = $(this).text();
            li_text = ctr + ". " + li_text;

            if (ctr < 4) {
                $(this).text(li_text);
            }
        });
    },

    /* 
        will just need a div with the ID of "rss" where you want the feed,
        uncomment the rss.js line in the Main.Master,
        and call this function in the document.ready 
    */
    createRSSWidget: function() {
        window.$rss = $("#rss").jqRSS(rssSettings);
    },

    /* 
        will just need a div with the ID of "instafeed" where you want the feed,
        uncomment the instafeed.min.js line in the Main.Master,
        and to call this function in the document.ready 

        If you need the first image from the instagram feed to have a different class
        (ie if you want it to have different styles), add the  addLargeClasstoInstagram() 
        function to in the window.load

    */
    getInsta: function() {
        var feed = new Instafeed({
                get: 'user',
                userId: 'REPLACE_WITH_USERID',
                accessToken: 'REPLACE_WITH_ACCESSTOKEN',
                limit: '12'
            });
            feed.run();

    },

    addLargeClasstoInstagram: function() {
        $(".tweetItem:first").addClass("tweetItemLarge");
        $(".tweetItem:first").removeClass("tweetItem");
    },

    setupYouTubeFeed: function() {
        var username = "visioncritical";
        var maxResults = "6";
        var key = "AIzaSyAZFmQ9LzSgHiGu66JtT1qkSAV-ysY3ceY";
        var channelQuery = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&callback=?&forUsername=" + username + "&key=" + key;

        $.getJSON(
           channelQuery, 
           function(data) {
            
              $.each( data.items, function( i, item ) {
                  pid = item.contentDetails.relatedPlaylists.uploads;
                  getVids(pid);
              });
          }
        );

        //Get Videos
        function getVids(pid){
            var playlistItems = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults="+maxResults+"&playlistId="+pid+"&callback=?&key="+key;

            $.getJSON(
                playlistItems,
                function(data) {
                    var results ="";
                    var thumbnailsList = "<div class='thumbnails-container'><div class='thumbnails-list'>";
                    $.each( data.items, function( i, item ) {

                        var videoId = item.snippet.resourceId.videoId;
                        //change medium to "high" or "default" if needed
                        //Setting the thumbnails to medium will remove the bars on top/bottom of the bars
                        var thumbnail = item.snippet.thumbnails.medium.url;

                        var title = item.snippet.title;
                        
                         if (i == 0) {
                            results += "<div class='iframe-container'><iframe src='//www.youtube.com/embed/"+ videoId + "' allowfullscreen></iframe></div>";
                            thumbnailsList +="<div class='thumbnail'><a class='video video"+i+"' title=\""+title+"\" name='video' href='#' targetVid='"+ videoId +"'><img src='" + thumbnail + "' alt='"+title+"'></a></div>";
                        } else {
                            thumbnailsList +="<div class='thumbnail'><a class='video video"+i+"' title=\""+title+"\" name='video' href='#' targetVid='"+ videoId +"'><img src='" + thumbnail + "' alt='"+title+"'></a></div>";
                        }
                        
                    });
                    thumbnailsList += "</div></div>";
                    results += thumbnailsList;

                    $(results).appendTo('#video-player');

                    //GET THE TITLE FOR THE MAIN VIDE
                    //change the "#title" to the div you want to show the title 
                    // $("#title").text($('#video-player .video0').attr('title'));


                    $('a[name=video]').click(function(e) {
                        e.preventDefault();

                        var videoID = $(this).attr('targetVid');
                        var embedURL = "//www.youtube.com/embed/"

                        url = embedURL + videoID;

                        $("#video-player iframe").attr("src",url);

                        //$("#title").text($(this).attr('title'));
                    });

                    /*This is where the scroll widget is initiated. Add your options here. 
                    More details can be found on this website: http://kenwheeler.github.io/slick/ or 
                    on our intranet site. */
                    $('.thumbnails-list').slick({
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        arrows: true,
                        infinite: false
                    })
                }
            );
        }
    },

    animateHamburgerIcon: function() {
         $('.nav-trigger').click(function(){
            $('.hamburger-icon').toggleClass('hamburger-icon-open');
        });
    },

    /*loads the carousel in a random order - just replace all instances 
      of #login-carousel with your carousel ID */
    randomizeCarousel: function() {
        var currentSlide;
        var rand;

        currentSlide = Math.floor((Math.random() * $('.item').length));
        rand = currentSlide;

        $('#login-carousel').carousel(currentSlide);
        $('#login-carousel').fadeIn(1000);

        setInterval(function(){ 
            while(rand == currentSlide){
                rand = Math.floor((Math.random() * $('.item').length));
            }

            currentSlide = rand;
            $('#login-carousel').carousel(rand);

        },5000);
    },
    showHideJoinButton: function() {
        var showHideWidgetArr = ["#join"]

        for (i=0; i<showHideWidgetArr.length; i++) {
            var theID = showHideWidgetArr[i];

            if ($(theID).length > 0) { 
                portal.hideWidget(theID); 
            }
        }
    },
    showHideWidget1: function() {
        var showHideWidgetArr = ["#widget1"]

        for (i=0; i<showHideWidgetArr.length; i++) {
            var theID = showHideWidgetArr[i];

            if ($(theID).length > 0) { 
                portal.hideWidget(theID); 
            }
        }
    },
    showHideWidget2: function() {
        var showHideWidgetArr = ["#widget2"]

        for (i=0; i<showHideWidgetArr.length; i++) {
            var theID = showHideWidgetArr[i];

            if ($(theID).length > 0) { 
                portal.hideWidget(theID); 
            }
        }
    },
    showHideWidget3: function() {
        var showHideWidgetArr = ["#widget3"]

        for (i=0; i<showHideWidgetArr.length; i++) {
            var theID = showHideWidgetArr[i];

            if ($(theID).length > 0) { 
                portal.hideWidget(theID); 
            }
        }
    },
    hideWidget: function(widgetID) {
        var _widgetID = widgetID;
        var _controlID = widgetID + "-control";
        $(_controlID).css("display", "none");
        $(_controlID).children("div").remove();

        if (($(_controlID).text().toUpperCase().indexOf("HIDE") >= 0 || $(_controlID).text() == "")) {
            $(_widgetID).css("display", "none");
        }
    }
}

$(document).ready(function() {
    portal.bodyClass();  
    portal.buttonDisabled();  
    portal.hideCloseDate();
    portal.animateHamburgerIcon();
    //portal.errorModal();    
    portal.showHideJoinButton();
    portal.showHideWidget1();
    portal.showHideWidget2();
    portal.showHideWidget3();
    portal.removeSurveyNumbering();
})

$(window).load(function() {
    portal.formClasses();
    portal.setHeights();
    //portal.setWidgetHeights();
    //portal.randomizeCarousel();
});

$(window).resize(function() {
    portal.setHeights();
    //portal.setWidgetHeights();
});