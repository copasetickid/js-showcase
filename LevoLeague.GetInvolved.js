var redirectURL = "http://"+window.location.hostname+"/signin.php";
var referredFriends = [];
var selectedAvatar;
var user_ids = [];



//MixPanel Utilties
LevoLeague.PledgePageTracking = function(){
  mixpanel.track_links("#tw a", "Get Involved", {"Stay Connected": "twitter"});
  mixpanel.track_links("#fb a", "Get Involved", {"Stay Connected": "facebook"});

  mixpanel.track_links("#NYC a",  "Local Levo", {"Location": "NYC"});
  mixpanel.track_links("#SF a",   "Local Levo", {"Location": "SF"});
  mixpanel.track_links("#N-A a ", "Local Levo", {"Location": "N-A"});

  $("#0").click(function(){
    mixpanel.track("Get Involved", {"Invite": "Mentor"});
  });

  $("#1, #2, #3").click(function(){
    mixpanel.track("Get Involved", {"Invite": "Peer"});
  });

  $("#4, #5, #6, #7, #8").click(function(){
    mixpanel.track("Get Involved", {"Invite": "Mentee"});
  });

}

//Get-Involeved Functions
LevoLeague.DisplayUserCallback = function displayUser(response){

    /*  Identified user  */
    if(response.UID)
    {
        var user = response['user'];
        var userName = user['nickname'];
        var userPicture = user['photoURL'];

        $("img#individual").attr('src', userPicture);
        $("div.userinfo > h2").text(userName);
        $(".username").html(", " + userName.split(' ')[0]);
        $(".section-goalmet > img").hide();
        LevoLeague.DisplayFriends();
    }

    /* Unidentified user */
    if(response.statusReason == "")
    {
       $("div.userinfo > h2").text("Guest");
       $("img#individual").attr('src', '/wp-content/themes/levo/css/images/default_user.png');
       $("div.userinfo > #levoMasterMind").append("<a href='" + redirectURL  + "'> We'd love to get to know you a little better! </a>");

       $(".section-goalmet > img ").hide();


    }
}


LevoLeague.DisplayPledgeUser = function(){
gigya.socialize.getUserInfo({callback:LevoLeague.DisplayUserCallback});
}


/* Spread The Word  Functions */


LevoLeague.UpdateProgress = function() {
      var params = {
          callback:LevoLeague.GetProgress
      }
      gigya.gcs.getUserData(params);
   }

LevoLeague.GetProgress = function(response){
     var progress =0;
     if(response.data.referredFriends){
       if(response.data.referredFriends.length > 9){
         progress++;
        $("div.sectionone").addClass("isdone");
       }
     }
     if(response.data.matched){
        if(response.data.matched == "true"){
           progress++;
           $("div.section-mentor").addClass("isdone");
        }
     }
     if(response.data.twitterFollower == "true" || response.data.facebookLike == "true"){
          progress++;
          $("div.sectionthree").addClass("isdone");
          $("#endbg").addClass("isdone");
     }
      LevoLeague.SetProgress(progress);
   }

LevoLeague.SetProgress = function(progress){

     $("div.progress > p").text(progress+"/3");
     if(progress == 1 ){
           $("img#stageProgress").attr({
            src: "/wp-content/themes/levo/css/images/l1-3.png",
            alt: ""
         });

     }
     if(progress == 2){
         //$("#mentored").text("Thank you for joining");
         $("img#stageProgress").attr({
            src: "/wp-content/themes/levo/css/images/l2-3.png",
            alt: ""
         });
     }
     if(progress == 3){
       $("img#stageProgress").attr({
         src:"/wp-content/themes/levo/css/images/l3-3.png",
         alt: ""
       });
       $(".section-goalmet > img ").show();
       $("#levoMasterMind > #intro > p").hide();
       $("#levoMasterMind").html('<p>LEVO MASTERMIND: </b><em>You\'re a full-fledged member of The Levo League!</em></p>');
     }
}

LevoLeague.CheckLoginProvider = function(response){
      if(response.user.loginProvider != "facebook"){
          var login = {
            provider: "facebook",
            facebookExtraPermissions: "publish_stream",
            callback: LevoLeague.LoginExistingUser
          }
          gigya.socialize.login(login);
      }
}

LevoLeague.LoginExistingUser = function(){
      LevoLeague.DisplayPledgeUser();
      gigya.socialize.showFriendSelectorUI(fs_params);
   }

LevoLeague.PostToWall = function(userId){
   var post = {};
   post.title = "Join me at the Levo League!";
   post.link = "levoleague.com";
   post.description = "free 24/7 access to the world's most inspirational & successful women, career resources, distinctive job openings, and even a 1:1 mentorship matching progrm. Made by Gen Y, for Gen Y";
   post.photo = "levoleague.com/root_styles/css/images/home.png";
   post.to = userId;
   LevoLeague.Facebook.PostToWall(post);
}

   var fs_params ={
          showEditLink: 'false',
          height: 360,
          width: 400,
          requiredCapabilities: 'friends'
    };


    fs_params['onSelectionDone'] = function(evt){
      var msg = evt.event + '-' + 'selected: ';
      var friends = evt['friends'];

      if(null!=friends){
          var friendArr = friends['arr'];
          if(null!=friendArr && friendArr.length > 0){
            var length = 0;
            if(referredFriends.length){
              length = referredFriends.length;
            }
              for(var index in friendArr){
                 var friend = friendArr[index];
                 console.log(friend);
                 var name = ' - Friend\'s Name is : ' + '(' + friend['nickname']+')';
                 msg += name + '\n';
                 referredFriend = {};
                 referredFriend.name = friend['nickname'];
                 referredFriend.uid = friend['UID'];
                 referredFriend.thumbNail = friend['thumbnailURL'];
                 referredFriend.position = selectedAvatar;
                 var facebookUID = friend.identities.facebook.providerUID;
                 referredFriend.facebookUID = facebookUID;
                 LevoLeague.PostToWall(facebookUID);

                 for(var pos in referredFriend){
                    if(referredFriend.position != ""){
                      $("#"+referredFriend.position).attr("src", referredFriend.thumbNail);
                    }
                    if(referredFriend.position == "butt-invite"){
                      $("#"+length).attr("src", referredFriend.thumbNail);
                    }
                 }
                 referredFriends.push(referredFriend);
                 //SpreadTheWord(length);
                 $("#friends-count").text(length);
              }
              var setUserParams = {
                      data: {referredFriends: referredFriends},
                      updateBehavior: "arraySet"
              };
                  gigya.gcs.setUserData(setUserParams);
          }
          else {
              msg += '- Error: Friends list is empty or null';
          }
      }
      if(friends == null){
      }
      else {
        msg += '-Error: No friends were returned';
      }
      LevoLeague.UpdateProgress();
    };


LevoLeague.DisplayFriends = function(){
   var params={
            callback: LevoLeague.PopulateFriends
      }
         gigya.gcs.getUserData(params);
    }

LevoLeague.PopulateFriends = function(response){
if(response.data){
if(response.data.referredFriends ){
     var count = response.data.referredFriends.length;
     //LevoLeague.SpreadTheWord(count);

    for(var i=0; i < response.data.referredFriends.length; i++){

       referredFriends.push(response.data.referredFriends[i]);

            if(referredFriends[i].position != ""){
              $("#"+referredFriends[i].position).attr("src", referredFriends[i].thumbNail);
            }
            if(referredFriends[i].position == "butt-invite"){
              $("#"+i).attr("src", referredFriends[i].thumbNail);
            }
            if(!referredFriends[i].position){
              $("#"+i).attr("src", referredFriends[i].thumbNail);
            }
        }
        $("#friends-count").text(count);
      }
      LevoLeague.UpdateProgress();
   }
}
LevoLeague.CheckLoginProvider = function (response){
    if(response.user.loginProvider != "facebook"){
       var login = {
         provider: "facebook",
         facebookExtraPermissions: "publish_stream",
         callback: LevoLeague.DisplayLoggedInPledgeUser
          }

          gigya.socialize.login(login);

          if(response.user.loginProvider == "facebook"){
            alert("Please disable popup blockers and try again.");
          }
      }

      if(response.user.loginProvider == "facebook"){
        gigya.socialize.showFriendSelectorUI(fs_params);
      }
   }

LevoLeague.DisplayLoggedInPledgeUser = function(){
  LevoLeague.DisplayPledgeUser();
  LevoLeague.HeaderInit();
  gigya.socialize.showFriendSelectorUI(fs_params);

}

LevoLeague.PledgePageInit = function(){
   $("a#butt-invite, #0, #1, #2, #3, #4, #5, #6, #7, #8").click(function(){
      selectedAvatar = $(this).attr("id");

      gigya.socialize.getUserInfo({callback:LevoLeague.CheckLoginProvider});

      mixpanel.track("Get Involved", {"SpreadTheWord": "ReferredFriend"});
   });
    $("#tw").click(function(){
        gigya.gcs.setUserData(LevoLeague.SetTwitterParams);
    });

    $("#fb").click(function(){
        gigya.gcs.setUserData(LevoLeague.SetFacebookParams);
    });

   $("#mentored, #butt-ll-nyc, #butt-ll-bay, #butt-ll-ni").click(function()
    {
        var selectedLocalLevo = $(this).attr("alt");
        var cssSelector = $(this).attr("id");
        //LevoLeague.TrackLinks("#"+cssSelector+" a",  "Get Involved", {"Location": selectedLocalLevo});
        // LevoLeague.TrackLocalLevo(cssSelector, selectedLocalLevo);
        gigya.gcs.setUserData(LevoLeague.SetLocalLevoParams);


    });

    LevoLeague.DisplayPledgeUser();
    //LevoLeague.DisplayFriends();
}
    //  Local Levo Functions
    LevoLeague.SetLocalLevoParams = {
      data:{matched: "true"},
      callback:LevoLeague.UpdateProgress
    };

    LevoLeague.DisplayLocalLevo = function(){
        var params ={
          fields: "matched",
          callback: LevoLeague.PopulateLocalLevo
        }
        gigya.gcs.getUserData(params);
    }

    LevoLeague.PopulateLocalLevo = function(response){
       if(response.data.matched){
           updateProgress();
      }
    }


     //Stay Connected Functions
    LevoLeague.SetTwitterParams = {
      data:{twitterFollower: "true" },
      callback: LevoLeague.UpdateProgress
    };

    LevoLeague.SetFacebookParams = {
      data:{facebookLike: "true" },
      callback: LevoLeague.UpdateProgress
    };

LevoLeague.DisplayStayConnected = function(){
      var params = {
        fields:"twitterFollower, facebookLike",
        callback: LevoLeague.PopulateSocialMedia
      }
      gigya.gcs.getUserData(params);
    }

LevoLeague.PopulateSocialMedia = function(response){
       if(response.data.twitterFollower = "true" || response.data.facebookLike == "true"){
          updateProgress();
       }
    }

