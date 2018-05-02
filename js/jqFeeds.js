if(typeof console === "undefined") {
	console={
		dir: function () {},
		log: function () {}
	}
}
(function (_$) {
var searchAPI = {};
searchAPI.getTwitterFeed = {
	_settings: {debug: "false"},
	tweetPromise: {},
	configure: function (settings) {
		var _self = this;
		$.extend(this._settings, settings);
		this.tweetCache = [];
		this.tweetPromise = this.getFeed(this);
	},
	getFeed: function (_self) {
		var userarr = [];
		var allajaxcalls = [];
		if(this._settings.user instanceof Array) {
			userarr = this._settings.user;
		} else {
			userarr.push(this._settings.user);
		}
		for (var i=0, length=userarr.length; i<length; i++) {
			var url = "https://search.twitter.com/search.json?include_entities=true&"
				+"from=" + userarr[i]
				+"&rpp=" + Math.ceil(this._settings.tweetCount / length)
				+"&with_twitter_user_id=true"
				+"&callback=?";
			var tempajax = $.getJSON( url );
			allajaxcalls.push(tempajax);
			$.when(tempajax).then(function (data) { 
				for (var i=0, length=data.results.length; i<length; i++) {
					_self.tweetCache.push(data.results[i]);
				}
			});
		}
		return $.when.apply(null, allajaxcalls);
	},
	sortFeeds: function () {
		var self = this;
		var sorter = function(a, b) {
			var dataa = new Date(a.created_at);
			var datab = new Date(b.created_at);
			return datab.valueOf() - dataa.valueOf();
		}
		this.tweetCache.sort(sorter);
	},
	createNewInstance: function() {
		var f = function () {};
		f.prototype = this;
		return new f;
	}
}
searchAPI.renderFeed = {
	configure: function (feedarr, settings, $targetElem) {
		this._settings = {
			tweetCount: 5,
			getProfilePic: true,
			linkLinks: true,
			linkHashes: true,
			linkMentions: true,
			getDate: true,
			renderCallback: null
		}
		this.thefeed = feedarr;
		this.containerElem = $targetElem; //EXPECTS JQUERY OBJECT
		this.$tweetwrap = $("<div class='tweetcontainer'></div>");
		console.log("configuring tweets: " + feedarr.length);
		$.extend(this._settings, settings);
	},
	createNewInstance: function() {
		var f = function () {};
		f.prototype = this;
		return new f;
	},
	render: function () {
		var localfeed = this.thefeed;
		for (var i=0, len=localfeed.length; i<len; i++) {
			var tweettext = localfeed[i].text;
			var $tweet = $("<div class='tweet'></div>");
			if(i==localfeed.length-1)
				$tweet.addClass("last");
			var $tweettextwrapper = $("<p class='tweetbody'></p>");
			if(this._settings.getProfilePic) {
				$tweet.append(this.handleProfilePic(localfeed[i]));
			}
			if(this._settings.linkLinks) {
				tweettext = this.handleLinks(localfeed[i], tweettext);
			}
			if(this._settings.linkHashes) {
				tweettext = this.handleHashes(localfeed[i], tweettext);
			}
			if(this._settings.linkMentions) {
				tweettext = this.handleMentions(localfeed[i], tweettext);
			}
			if(this._settings.getDate) {
				var $date = this.handleDates(localfeed[i]);
			}
			$tweettextwrapper.append(tweettext);
			$tweet.append($tweettextwrapper);
			$tweet.append($date);
			this.$tweetwrap.append($tweet);
		}
		this.containerElem.append(this.$tweetwrap);
		if(this._settings.renderCallback) this._settings.renderCallback.call(this.containerElem);
	},
	handleDates: function (feed) {
		var $timestampcontainer = $("<div class='tstamp'></div>");
		var datecreate = new Date(feed.created_at);
		//$timestampcontainer.append(datecreate.toLocaleDateString() + " at " + datecreate.toLocaleTimeString());
		$timestampcontainer.append(this.hoursAgo(Date.parse(datecreate)));
		return $timestampcontainer;
	},
	handleProfilePic: function (feed) {
		var user = feed.from_user;
		var $linkwrap = $("<a href='http://www.twitter.com/#!/" + user + "'" + "target='_blank' class='profileimglink'></a>");
		var $newimg = $("<img src='' class='tweetprofilepic' align=\"left\"/>");
		$newimg.attr("src", feed.profile_image_url_https);
		$linkwrap.append($newimg);
		return $linkwrap;
	},
	handleLinks: function (feed, tweetBody) {
		var _urls = feed.entities.urls;
		if(_urls) {
			var _tweetBody = tweetBody;
			for (var j=0, ulength=_urls.length; j<ulength; j++) {
				var tempRepl = "<a href='" + _urls[j].url + "' target='_blank' title='"+_urls[j].expanded_url+"'>" + _urls[j].url + "</a>";
				var reg = new RegExp(_urls[j].url, 'gi');
				_tweetBody = _tweetBody.replace(reg, tempRepl);
			}
		}
		return _tweetBody;
	},
	handleHashes: function (feed, tweetBody) {
		var hashes = feed.entities.hashtags;
		var _tweetBody = tweetBody;
		if (hashes) {
			var hashesURL = "";
			var tempRepl = "";
			var reg = "";
			for (var j=0, ulength=hashes.length; j<ulength; j++) {
				hashesURL = "http://twitter.com/#!/search?q=%23" + hashes[j].text;
				tempRepl = "<a href='" + hashesURL + "' target='_blank' title='"+hashes[j].text+"'>#" + hashes[j].text + "</a>";
				reg = new RegExp("#"+hashes[j].text, 'gi');
				_tweetBody = _tweetBody.replace(reg, tempRepl);
			}
		}
		return _tweetBody;
	},
	handleMentions: function (feed, tweetBody) {
		/*
		//This is only good with REST API, where mentions are available as part of entities
		var _mentions = mentions;
		var _tweetBody = tweetBody;
		for (var j=0, ulength=_mentions.length; j<ulength; j++) {
			var mentionerURL = "http://twitter.com/#!/" + _mentions[j].screen_name;
			var tempRepl = "<a href='" + mentionerURL + "' target='_blank' title='"+_mentions[j].name+"'>@" + _mentions[j].screen_name + "</a>";
			var reg = new RegExp("@"+_mentions[j].screen_name, 'gi');
			_tweetBody = _tweetBody.replace(reg, tempRepl);
		}*/
		var reg = /(@\w+)/gim;
		var _tweetBody = tweetBody;
		var _tweetBody = _tweetBody.replace(reg, "<a href=\"http://twitter.com/#!/$1\" target=\"_blank\">$1</a>");
		return _tweetBody;
	},
	hoursAgo: function (date) {
		var now = new Date();
		var diff = ((now - date)/1000) / 60 / 60;
		if(diff < 1) { return "Less than an hour ago";} else {
			var floored = Math.floor(diff);
			return floored + ((floored>1)? " hours ago" : " hour ago");
		}
	}
}

/*********************************************************
/** Twitter RESTFUL Overrides
**********************************************************/
var RESTAPI = {
	getTwitterFeed: searchAPI.getTwitterFeed.createNewInstance(),
	renderFeed: searchAPI.renderFeed.createNewInstance()
};
RESTAPI.getTwitterFeed.getFeed = function (_self) {
	var userarr = [];
	if(this._settings.user instanceof Array) {
		userarr = this._settings.user;
	} else {
		userarr.push(this._settings.user);
	}
	var allajaxcalls = [];
	for (var i=0, length=userarr.length; i<length; i++) {
		var url = "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&"+
				"screen_name=" + userarr[i] +
				"&"+
				"count=" + Math.ceil(this._settings.tweetCount / length) +
				"&callback=?";
		var tempajax = $.getJSON( url );
		allajaxcalls.push(tempajax);
		$.when(tempajax).then(function (data) { 
			for (var i=0, length=data.length; i<length; i++) {
				_self.tweetCache.push(data[i]);
			}
		});
	}
	return $.when.apply(null, allajaxcalls);
};
RESTAPI.renderFeed.handleProfilePic = function (feed) {
	var user = feed.user.screen_name;
	var $linkwrap = $("<a href='http://www.twitter.com/#!/" + user + "'" + "target='_blank' class='profileimglink'></a>");
	var $newimg = $("<img src='' class='tweetprofilepic' align=\"left\"/>");
	$newimg.attr("src", feed.user.profile_image_url_https);
	$linkwrap.append($newimg);
	return $linkwrap;
};
/*********************************************************
/** Twitter LIST RESTFUL Overrides
**********************************************************/
var LISTREST = {
	getTwitterFeed: RESTAPI.getTwitterFeed.createNewInstance(),
	renderFeed: RESTAPI.renderFeed.createNewInstance()
};
LISTREST.getTwitterFeed.getFeed = function (_self) {
	var userarr = [];
	if(this._settings.user instanceof Array) {
		userarr = this._settings.user;
	} else {
		userarr.push(this._settings.user);
	}
	var allajaxcalls = [];
	for(var i=0, length=userarr.length; i<length; i++) {
		var url = "https://api.twitter.com/1/lists/statuses.json?include_entities=true&include_rts=true&"+
		"owner_screen_name=" + userarr[i]['username'] + "&" + 
		"slug="  + userarr[i]['listslug'] +
		"&per_page=" + this._settings.tweetCount +
		"&page=1" +
		"&callback=?";
		var tempajax = $.getJSON( url );
		allajaxcalls.push(tempajax);
		$.when(tempajax).then(function(data) { 
			for(var i=0, length=data.length; i<length; i++) {
				_self.tweetCache.push(data[i]);
			}
		});
	}
	return $.when.apply(null, allajaxcalls);
};

/*********************************************************
/** YouTibe Overrides
**********************************************************/
var YOUTUBE = {
	getYouTubeFeed: searchAPI.getTwitterFeed.createNewInstance(),
	renderFeed: searchAPI.renderFeed.createNewInstance()
};
YOUTUBE.getYouTubeFeed.getFeed = function (_self) {
	var userarr = [];
	if(this._settings.user instanceof Array) {
		userarr = this._settings.user;
	} else {
		userarr.push(this._settings.user);
	}
	var allajaxcalls = [];
	for(var i=0, length=userarr.length; i<length; i++) {
		//https://gdata.youtube.com/feeds/api/users/cocacola/uploads?v=2&alt=json&max-results=4&callback=?
		var url = "https://gdata.youtube.com/feeds/api/users/"+
		userarr[i] + "/uploads?v=2&alt=json"+
		"&max-results=" + this._settings.tweetCount +
		"&callback=?";
		var tempajax = $.getJSON( url );
		allajaxcalls.push(tempajax);
		$.when(tempajax).then(function(data) { 
			for(var i=0, length=data.length; i<length; i++) {
				_self.tweetCache.push(data[i]);
			}
		});
	}
	return $.when.apply(null, allajaxcalls);
};
YOUTUBE.renderFeed.render = function (_self) {
	var localfeed = this.thefeed;
	var list_data = "";
	var $feedtextwrapper = $("<div class='feedbody'></div>");
	for (var i=0, len=localfeed.length; i<len; i++) {
		var feedTitle = localfeed[i].title.$t;
	    var feedURL = localfeed[i].link[1].href;
	    var fragments = feedURL.split("/");
	    var videoID = fragments[fragments.length - 2];
	    var url = videoURL + videoID;
	    var thumb = "https://img.youtube.com/vi/"+ videoID +"/default.jpg";
	    list_data += '<div class="video video'+i+'"><a href="#" title="'+ feedTitle +'" name="video" targetVid="'+videoID+'"><img alt="'+ feedTitle+'" src="'+ thumb +'"/></a>'+'<h3><a href="#" title="'+ feedTitle +'" name="video" targetVid="'+videoID+'">'+ feedTitle +'</h3></a></div>';
	    
		$feedtextwrapper.append(list_data);
		this.$feedwrap.append($feed);
	}
	this.containerElem.append(this.$feedwrap);
};
/*********************************************************
/** Tumblr Overrides
**********************************************************/
var Tumblr = {
	getTumblrFeed: searchAPI.getTwitterFeed.createNewInstance(),
	renderFeed: searchAPI.renderFeed.createNewInstance()
};
Tumblr.getTumblrFeed.getFeed = function (_self) {
	var userarr = [];
	if(this._settings.user instanceof Array) {
		userarr = this._settings.user;
	} else {
		userarr.push(this._settings.user);
	}
	var allajaxcalls = [];
	for (var i=0, length=userarr.length; i<length; i++) {
		var url = "http://"+ userarr[i]
			+".tumblr.com/api/read/json?&num="
			+Math.ceil(this._settings.feedCount / length)
			+"&callback=?";
		var tempajax = $.getJSON( url );
		allajaxcalls.push(tempajax);
		$.when(tempajax).then(function (data) { 
			for (var i=0, length=data.posts.length; i<length; i++) {
				_self.tweetCache.push(data.posts[i]);
			}
		});
	}
	return $.when.apply(null, allajaxcalls);
};
Tumblr.renderFeed.configure = function (feedarr, settings, $targetElem) {
	this.thefeed = feedarr;
	this.containerElem = $targetElem; //EXPECTS JQUERY OBJECT
	this.$feedwrap = $("<div class='feedcontainer'></div>");
	console.log("configuring tumblr feeds: " + feedarr.length);
	$.extend(this._settings, settings);
};
Tumblr.renderFeed.render = function () {
	var localfeed = this.thefeed;
	for (var i=0, len=localfeed.length; i<len; i++) {
		var posttype = localfeed[i].type;
		var $feed = $("<div class='feed'></div>");
		var $feedtextwrapper = $("<p class='feedbody'></p>");
		var feedtext = localfeed[i].text;
		if(posttype === "regular") {
			var $feedbodycontainer = $("<div class='feedbody'></div>");
			var feedlink = localfeed[i].url;
			var $feedtitle = $("<h3 class='feedtitle'><a href='"+feedlink+"' target='_blank'>"+localfeed[i]['regular-title']+"</a></h1>");
			var $feedbody = $(localfeed[i]['regular-body']);
			var $feedbodyimage = $feedbody.find("img");
			if($feedbodyimage.length) {
				$feedbodycontainer.append($feedbodyimage.eq(0));
			}
			if($feedtitle === "" && $feedbodyimage.length<=0) {
				feedtext = $feedbody.text();
				$feedbodycontainer.append(feedtext.substr(0, 50) + "...");
			}
			$feedtextwrapper.append($feedtitle);
			$feedtextwrapper.append($feedbodycontainer);

		} else if(posttype === "photo") {
			$feed.addClass("photo");
			var $postimg = $("<img src='" + localfeed[i]['photo-url-250'] + "'/>");
			$feed.append($postimg);
		} else {
			//other types include links, videos, audio, answer
			return;
		}
		// if(this._settings.getDate) {
		// 	var $date = this.handleDates(localfeed[i]);
		// }
		$feed.append($feedtextwrapper);
		//$feed.append($date);
		this.$feedwrap.append($feed);
	}
	this.containerElem.append(this.$feedwrap);
	if(this._settings.renderCallback) this._settings.renderCallback.call(this.containerElem);
};

/************************ jQuery plugin **********************************/

$.fn.jqTweet = function (settings) {
	var feedInstance = {
		getTwitterFeed: searchAPI.getTwitterFeed.createNewInstance(),
		renderFeed: searchAPI.renderFeed.createNewInstance()
	};
	var $caller = this; //store jQuery caller object for later use
	var _settings = {//default settings
		tweetCount: 10,
		getProfilePic: true,
		linkLinks: true,
		linkHashes: true,
		linkMentions: true,
		getDate: true,
		emptyMsg: "Twitter feed is unavailable",
		debug: true
	};
	$.extend(_settings, settings);
	feedInstance.getTwitterFeed.configure(_settings);
	feedInstance.getTwitterFeed.tweetPromise.then(
		function () {
			feedInstance.getTwitterFeed.sortFeeds();
			if(feedInstance.getTwitterFeed.tweetCache.length > _settings.tweetCount) {
				feedInstance.getTwitterFeed.tweetCache = feedInstance.getTwitterFeed.tweetCache.slice(0, _settings.tweetCount);
			}
			feedInstance.renderFeed.configure(feedInstance.getTwitterFeed.tweetCache, _settings, $caller);
			feedInstance.renderFeed.render();
		},
		function () {/*Fail*/}
	);
return $caller;
}

$.fn.jqTweetREST = function (settings) {
	var feedInstance = {
		getTwitterFeed: RESTAPI.getTwitterFeed.createNewInstance(),
		renderFeed: RESTAPI.renderFeed.createNewInstance()
	};
	var $caller = this; //store jQuery caller object for later use
	var _settings = {//default settings
		tweetCount: 10,
		getProfilePic: true,
		linkLinks: true,
		linkHashes: true,
		linkMentions: true,
		getDate: true,
		emptyMsg: "Twitter feed is unavailable",
		debug: true
	};
	$.extend(_settings, settings);
	feedInstance.getTwitterFeed.configure(_settings);
	feedInstance.getTwitterFeed.tweetPromise.then(
		function () {
			feedInstance.getTwitterFeed.sortFeeds();
			if(feedInstance.getTwitterFeed.tweetCache.length > _settings.tweetCount) {
				feedInstance.getTwitterFeed.tweetCache = feedInstance.getTwitterFeed.tweetCache.slice(0, _settings.tweetCount);
			}
			feedInstance.renderFeed.configure(feedInstance.getTwitterFeed.tweetCache, _settings, $caller);
			feedInstance.renderFeed.render();
		},
		function () {/* Fail */}
	);
return $caller;
}
$.fn.jqTumblr = function (settings) {
	var feedInstance = {
		getTumblrFeed: Tumblr.getTumblrFeed.createNewInstance(),
		renderFeed: Tumblr.renderFeed.createNewInstance()
	};
	var $caller = this;
	var _settings = {
		feedCount: 5,
		getDate: true
	}
	$.extend(_settings, settings);
	feedInstance.getTumblrFeed.configure(_settings);
	feedInstance.getTumblrFeed.tweetPromise.then(
		function () {
			feedInstance.renderFeed.configure(feedInstance.getTumblrFeed.tweetCache, _settings, $caller);
			feedInstance.renderFeed.render();
		},
		function () {/* Fail */}
	);
}
$.fn.jqTweetLIST = function (settings) {
	console.log("list go!")
	var feedInstance = {
		getTwitterFeed: LISTREST.getTwitterFeed.createNewInstance(),
		renderFeed: LISTREST.renderFeed.createNewInstance()
	};
	var $caller = this;
	var _settings = {
		feedCount: 5,
		getDate: true
	}
	$.extend(_settings, settings);
	feedInstance.getTwitterFeed.configure(_settings);
	feedInstance.getTwitterFeed.tweetPromise.then(
		function () {
			feedInstance.renderFeed.configure(feedInstance.getTwitterFeed.tweetCache, _settings, $caller);
			feedInstance.renderFeed.render();
		},
		function () {/* Fail */}
	);
}
$.fn.youtubeFeed = function (settings) {
	console.log("youtube go!")
	var feedInstance = {
		getTwitterFeed: YOUTUBE.getTwitterFeed.createNewInstance(),
		renderFeed: YOUTUBE.renderFeed.createNewInstance()
	};
	var $caller = this;
	var _settings = {
		feedCount: 5,
		getDate: true
	}
	$.extend(_settings, settings);
	feedInstance.getTwitterFeed.configure(_settings);
	feedInstance.getTwitterFeed.tweetPromise.then(
		function () {
			feedInstance.renderFeed.configure(feedInstance.getTwitterFeed.tweetCache, _settings, $caller);
			feedInstance.renderFeed.render();
		},
		function () {/* Fail */}
	);
}
})(jQuery);