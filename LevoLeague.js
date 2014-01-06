LevoLeague = {};

LevoLeague.InviteFriend = function()
{
  window.open('https://www.facebook.com/dialog/send?app_id=308052035951943&name=Spread%20the%20%23levolove&link=http://www.levoleague.com&description=Join%20The%20Levo%20League,%20the%20premier%20online%20social%20network%20designed%20to%20support%20and%20connect%20female%20professionals%20in%20the%20formative%20years%20of%20their%20careers%2E%20Take%20advantage%20of%20Levo%27s%20free%20career%20strategy%20resources%2C%20management%2Dtrack%20job%20listings%20from%20female%2Dfriendly%20companies%2C%20and%20live%20interactive%20video%20interviews%20with%20successful%20businesswomen%2E&redirect_uri=http://www.levoleague.com/home', "_blank", "width=990, height=600");
}


LevoLeague.LogoutResponse = function(response)
{
    window.location = "/";
}

var currentURL = window.location.host;
var staging = 'staging.levoleague.com';
var acceptance = 'acceptance.levoleague.com';
var production = 'levoleague.com';

  if(currentURL == staging ){
    LevoLeague.lounge_url = "http://lounge.staging.levoleague.com";
  }
  else if(currentURL == acceptance ){
    LevoLeague.lounge_url = "http://lounge.acceptance.levoleague.com";
  }
  else{
    LevoLeague.lounge_url = "http://lounge.levoleague.com";
  }


//LevoLeague HTML Manipulation
LevoLeague.TwitterView = function(){         //Twitter Tweet call
$.ajax({
   type: 'GET',
   dataType: 'jsonp',
   url:'https://api.twitter.com/1/statuses/user_timeline.json?screen_name=levoleague&count=1',
   success: function(data){
       $.each(data, function(index, tweet)
       {
          var levoTweet = tweet.text
          var currentTweet = levoTweet.parseURL().parseTwitterName().parseHashTag();
          var levoTwitter = 'https://twitter.com/levoleague';
            // $('li.current-conversation > p > em').append( "<a href=' " + levoTwitter + "'>" + currentTweet + "</a>" + '<br/>');
          $('li.current-conversation > p > em').append(currentTweet);
       });
   },
   error: function(data){
    $("li.current-conversation > p > em ").append("Levo League tweets are unavailable");
   }
 });

}



//LevoLeague Utilities
// This is the "share" link next to all article lists
LevoLeague.ShareContentLink = function(url)
{
 day = new Date();
 id = day.getTime();
 url = url.replace("/?p=","/article/?p=");
 eval("page" + id + " = window.open(url, '" + id + "', 'toolbar=0,scrollbars=1,location=1,statusbar=0,menubar=0,resizable=0,width=600,height=320');");
}


// Homepage slider
LevoLeague.SetHomeSlider = function()
{
 $('.slides').carouFredSel(
 {
  items:1,
  auto:{pauseDuration:4000},
		scroll:{duration:500,fx:'crossfade'},
		pagination:{container:$('.paging')}
	});
}


// On air counter
LevoLeague.OnAir =
{
	ohData : {},

	init : function(dnow, dofh, ishome)
	{
		now = Date.parse(dnow);
		oh_beg = Date.parse(dofh);
		oh_end = oh_beg + (60 * 1000 * 30);
		if( now >= oh_beg && now < oh_end)
		{
			this.ShowOnAir();
		}
		else if( now < oh_beg )
		{
			this.ohData.isHome = ishome;
			this.ohData.untilEvent = oh_beg - now;
			this.ohData.timerStart = ( new Date().getTime() );
			this.ohData.timerID = setInterval(function(){ LevoLeague.OnAir.UpdateTimer(); }, 1000);
		}
	},

	UpdateTimer : function()
	{
		var pTime = ( new Date().getTime() ) - this.ohData.timerStart;

		if(pTime >= this.ohData.untilEvent)
		{
			clearInterval(this.ohData.timerID);
			this.ShowOnAir();
		}
		else
		{
			var x = (this.ohData.untilEvent - pTime) / 1000;

			var S = Math.round(x % 60); x /= 60;
			var M = Math.floor(x % 60); x /= 60;
			var H = Math.floor(x % 24); x /= 24;
			var D = Math.floor(x);

			var strS = (S==1) ? " second" : " seconds";
			var strM = (M==1) ? " minute" : " minutes";
			var strH = (H==1) ? " hour" : " hours";
			var strD = (D==1) ? " day" : " days";

			var cStr = (this.ohData.isHome) ? " | " : "";

			if( (D+H+M) == 0 )
				cStr += S + strS;
			else if( (D+H) == 0)
				cStr += M + strM + ", " + S + strS;
			else if( D == 0 )
			{
				if( M == 0 )
					cStr += H + strH;
				else
					cStr += H + strH + ", " + M + strM;
			}
			else
			{
				if( (H+M) == 0 )
					cStr += D + strD;
				else if( M == 0 )
					cStr += D + strD + ", " + H + strH;
				else
					cStr += D + strD + ", " + H + strH + ", " + M + strM;

			}

    jQuery("#oh-counter").text(cStr);
  }
},

	ShowOnAir : function()
	{
		jQuery("body").addClass("on-air");
		jQuery('.air').html('<a href="/office-hours">on air</a>');
		jQuery("#oh-title").text("STREAMING LIVE");
		jQuery('#oh-title-sub').html('<em><a href="/office-hours">listen-in</a></em>');
		if(!this.ohData.isHome) jQuery("#oh-counter").text("");
	}
};


//MixPanel Utilties

LevoLeague.HomePageTracking = function(){

    mixpanel.track_links(" #search a", "Search Page");
    mixpanel.track_links("#see-more a", "Article Page");
    if($("#profilebox-rt > li#login-levo > a").text() == "log in"){
      mixpanel.track("Home Page", {"user" : "Guest" });
    }
    else{
      mixpanel.track("Home Page", {"user" : "Logged"});
    }
    $(" li.last > a, a.get-involved").click(function(){
      mixpanel.track("Get Involved");
    });

    $(".posts > li > h3 > a").click(function(){
      var author = $(this).parent('h3').siblings("div").children("a").text();
      author = author.replace('>>', '');
      mixpanel.track("Home Page", {"Author" : author});
    });

}


LevoLeague.OfficeHoursTracking =function(){
    $(".itembox").click(function(){
      var mentor = $(this).children("div").children("span").closest(".ohtitle").text();
      mixpanel.track("Office Hours", {"Guest Mentor": mentor});
    });
}

//Extending the String namespace
String.prototype.parseURL = function() {
       return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
         return url.link(url);
        });
};

String.prototype.parseTwitterName = function() {
     return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
           var username = u.replace("@","")
           return u.link("http://twitter.com/"+username);
      });
};

String.prototype.parseHashTag = function() {
    return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
         var tag = t.replace("#","%23")
         return t.link("http://search.twitter.com/search?q="+tag);
     });
};


//Header Pop-Up-Display
LevoLeague.PopUpDisplay = function() {

  var popup_closed = LevoLeague.GetPopUpCookie();
  if(popup_closed == undefined){
    popup_closed = false;
  }

    if( $("#join-levo").length == 0 || (popup_closed)){
        $("#pop-up").hide();
        $(".nav-pos").addClass("navigation-user");
    }
    else{
        $('#pop-up').show();
        $("#pop-up-close").click(function(){
          LevoLeague.CreatePopUpCookie();
          $("#pop-up").animate({ height: 'toggle'}, 1000);
          mixpanel.track("Sign Up Pop Up", {"action": "close"});

        });
        $(".nav-pos").addClass("navigation-guest");

         mixpanel.track_links("li#join-levo a", "Sign Up Pop Up", {"action": "button"});

    }
}

LevoLeague.CreatePopUpCookie = function(){
    var host = 'http://www.levoleague.com';
    if(window.location.host == 'dev.content.levoleague.com') host = 'http://dev.levoleague.com';
    else if(window.location.host == 'staging.content.levoleague.com') host = 'http://staging.levoleague.com';
    else if(window.location.host == 'localhost') host = 'http://localhost:3000';
    $.ajax({
        url: host+'/set-cookie',
        xhrFields: {
              withCredentials: true
           }
    });
}

LevoLeague.GetPopUpCookie = function(){
    //console.log(document.cookie)
    var start = document.cookie.indexOf( "_levo_popup=" );
    var name = '_levo_popup';
    if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) )
    {
        return false;
    }
    if ( start == -1 ) {
        return false;
    }
    return true;
}

