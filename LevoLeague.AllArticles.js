/* Ultitly function for the cookie */
var docCookies = {
  getItem: function (sKey) {
    if (!sKey || !this.hasItem(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function (sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) { return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};

/* Create an Article Comment */
LevoLeague.PostComment = function(articleComment){

  var contentEnv = window.location.host,
    airWolfHost = LevoLeague.AirWolfHost(contentEnv);

  var title = $(".title > h2").text();
  title = title.replace('>>', ' ');

  var articleURL = window.location.href;

  $("#newComment").click(function(){
    var commentContent =  $("#article-comment").val();

      if(commentContent == ""){
        $("#js-comment-error").text("Oops! You forget to write in your comment.");
      }
      else{
          articleComment.commentData.content = commentContent;
          
          var articleImg = $(".article > img").attr("src");


          /* Post comment to airwolf */
          $.ajax({
              type: "POST",
              url: "http://"+ airWolfHost + "/api/comment/create",
              data: articleComment,
              success: function(response, textStatus, jqXHR){
                $("#article-comment").val('');
                var nickName = LevoLeague.UserEmail.split("@");
                var author_photo = "<img class=\" comment-photo \"  src=\" "+  LevoLeague.UserPhoto + " \" alt=\"user photo \"  >  " ;
                var name_date = "<div> <span class=\" comment-name \"> " + nickName[0] + " just now </span>";
                var content = "<div class= \"comment-text \" >"+ commentContent + "</div><br> " ;

                var commentBox = '<div class="js-comment">' + author_photo + name_date + content + '</div>';
                $(".comment-box").after(commentBox);

                /* Empty out error text if present before */
                $("#js-comment-error").text(" ");

                 /*Increse comment count */
                  var total = +$(".js-comment-count").text().split(" ")[0];
                  
                  if(total >= 1){
                    total++;
                    $(".js-comment-count").text(total + " Comments");
                  } 
                  else if(total == " "){
                    $(".js-comment-count").text("1 Comment");
                  }
                  
                 /* Share on Social Media */
                 var title = $(".title > h2").text();
                 title = title.replace('>>', ' ');

                 var facebookTitle = "Commented on: " + title;
                 var articleImg = $(".article > img").attr("src");

                /* Share on Social Media */
                $.ajax({
                  type: 'GET',
                  dataType: 'jsonp',
                  crossDomain: true,
                  url: 'https://api-ssl.bitly.com/v3/shorten?login=o_kagr98eeb&apiKey=R_8c73cecbb52dfb3df9a7fd399cdf736d&longUrl=' + articleURL,
                  success: function(data, textStatus, jqXHR){
                    var shortenURL = data.data.url;
                     if($("#fb-share").is(':checked')){
                        LevoLeague.ShareOnFacebook(facebookTitle, shortenURL, commentContent, articleImg);
                     }
                     if($("#tw-share").is(':checked')){
                        LevoLeague.ShareOnTwitter(commentContent, shortenURL);
                     }
                  }
                });  
              },
              error: function(data, textStatus, jqXHR){
                var httpStatus = jqXHR.status, status = data.statusText;
                if(httpStatus > 300 || status == "error"){
                  $("#js-comment-error").text("To post a comment, please sign out and sign back in.");
                }
              }
          });
      }
  }); //End of submit comment
}

/*Delete an Article Comment */
LevoLeague.DeleteComment = function(deleteCommentData){

  var contentEnv = window.location.host,
  airWolfHost = LevoLeague.AirWolfHost(contentEnv);

  $.ajax({
      type: "POST",
      url: "http://"+ airWolfHost + "/api/comment/remove",
      data: deleteCommentData,
      success: function(){

       /*Decrease comment count */
        var total = +$(".js-comment-count").text().split(" ")[0];
       
        if(total > 2){
          total--;
          $(".js-comment-count").text(total + " Comments");
        }
        else if(total == 2){
          total--;
          $(".js-comment-count").text(total + " Comment");
        }
        else if(total == 1){
          $(".js-comment-count").text(" ");
        }     
      },
      error: function(){}
  });
}

LevoLeague.InitDisplayComments = function(){
    var contentEnv = window.location.host,
    airWolfHost = LevoLeague.AirWolfHost(contentEnv);

    LevoLeague.Comments(airWolfHost, LevoLeague.ArticleID);

}

LevoLeague.InitComments = function(){
  var levoUser = docCookies.getItem('levo_user');
  LevoLeague.InitDisplayComments();
  
  /* Actions for Logged-In Users */
  if( levoUser != null){
    $("img#current-user").attr('src', LevoLeague.UserPhoto);
 
    if(!LevoLeague.UserToken){
       var contentEnv = window.location.host,
        airWolfHost = LevoLeague.AirWolfHost(contentEnv);
       window.location = "http://"+airWolfHost+"/users/sign_in";
    }
    var articleComment = {auth_token: LevoLeague.UserToken, commentData:{content: "",
                          profileId: LevoLeague.ProfileID, parentId: LevoLeague.ArticleID, 
                          parentType: "article" , userIp: LevoLeague.UserIP,
                          permalink: LevoLeague.ArticleURL, title: LevoLeague.ArticleTitle }};

    LevoLeague.PostComment(articleComment);

  }
  /* Actions for Non-Logged-In Users */
  else{
  
    $("#article-comment").focus(function(){
        $("#article-pop-up").show();
        $("#article-pop-up-overlay").show();
    });

    $("#newComment").click(function(){
      $("#article-pop-up").show();
      $("#article-pop-up-overlay").show();
    });

    $(".close-btn").click(function(){
      $("#article-pop-up").hide();
      $("#article-pop-up-overlay").hide();
    });
  }
}

/* Determine Airwolf environment */
LevoLeague.AirWolfHost = function(contentEnv){
  var airwolfEnv;
  if(contentEnv == 'localhost' || contentEnv == 'dev.content.levoleague.com'){
    return airwolfEnv = 'dev.levoleague.com';
  }
  else if(contentEnv == 'staging.content.levoleague.com'){
    return airwolfEnv = 'staging.levoleague.com';
  }
  else{
    return airwolfEnv = 'www.levoleague.com';
  }
}


/* Request Article Comments from airwolf */
LevoLeague.Comments = function(airWolfHost, wpArticleId){

  $.ajax({
    type: "GET",
    dataType: "jsonp",
    crossDomain: true,
    url: "http://"+airWolfHost+"/api/comments/article/"+wpArticleId,
    success: function(data){
      LevoLeague.DisplayComments(data.comments);
      LevoLeague.DisplayCommentTotal(data.comments);
    },
    error: function(data){}
  });
}

/* Convert date to days */
LevoLeague.CalculateCommentDate = function(date){

  var dateObj = new Date();
    
  var monthNames = ['January', 'February', 'March', 'April',
                     'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
  var time, monthNum;
  var dateFormat = date.split(" ");
  var year = dateFormat[2], month = dateFormat[0], day = dateFormat[1].split(",")[0];

  var oneDay = 24*60*60*1000;
  var hoursInADay = 1000*60*60;

  var currentMonth = dateObj.getMonth() + 1, currentYear = dateObj.getFullYear(),
      currentDate = dateObj.getDate();

  var todaysDate = new Date(currentYear, currentMonth, currentDate);

  for(var m =0; m < monthNames.length; m++){
    if(month == monthNames[m]){
      monthNum = m +1;
      var commentDate = new Date(year, monthNum, day);

      var dates = Math.abs(commentDate.getTime() - todaysDate.getTime());
      var days = Math.round(dates / (oneDay));
      var hours = Math.floor(dates / (hoursInADay));
      var mins = Math.floor(dates / (1000*60));

      if(hours > 24){
        if(hours > 1){
          return time  = days + " days ago"
        }
        else
          return time = days + " day ago";
      }
      else if(hours >=  1 &&  24 <= hours){
        return time = hours + " hours ago";
      }
      else if(hours == 1){
        return time = hours + " hours ago";
      }
      else if(mins > 1 && 59 <= mins){
        return time = mins + " minutes ago";
      }
      else if(mins <= 1){
        return time = "just now"
      }
    }
  }
} 

/* Display Article Comments */
LevoLeague.DisplayComments = function(comments){
  
  for(var i = 0; i < comments.length; i++){

    var date = comments[i].comment_date;
    var postDate = LevoLeague.CalculateCommentDate(date);

    if(!comments[i].author_avatar ||  !comments[i].author_avatar.match(/^https?:\/\//)){
      comments[i].author_avatar = 'http://www.levoleague.com/assets/default_user.png';
    }
    if(!comments[i].author || comments[i].author == " "){
      comments[i].author = "Guest";
    }
     /* Logged-In-User or Admin-User */
    if(LevoLeague.UserToken != null){
      if(comments[i].author_id == LevoLeague.ProfileID || LevoLeague.AdminUser == "true"){

        var author_photo = "<img class=\"comment-photo\"  src=\""+  comments[i].author_avatar+ "\" alt=\"user photo \"  >  " ;

        var name_date = "<span class=\" comment-name \"> " + comments[i].author + "    " + postDate + "</span>";

        var content_deleteBtn = "<div class= \"comment-text\"> <div class= \"comment-text-area \" >    " + comments[i].content + " </div> <a class=\"js-delete-comment \" >Delete </a> </div>"
        
        var commentID = "<div class=\"user-comment-id \" style=\" display: none; \" >" + comments[i].comment_id + "</div>";

        var commentBox = '<div class="js-comment">' + author_photo + name_date +  content_deleteBtn + commentID + '</div>';
        $(".comments-area").append(commentBox);
      }
      else{
        var author_photo = "<img class=\" comment-photo \"  src=\" "+  comments[i].author_avatar+ " \" alt=\"user photo \"  >  " ;

        var name_date = "<span class=\" comment-name \"> " + comments[i].author + "    " + postDate + "</span>";

        var content = "<div class= \"comment-text \"> <div class=\"comment-text-area\" > "+ comments[i].content + "</div></div> " ;

        var commentBox = '<div class="js-comment">' + author_photo + name_date + content + '</div>';
        $(".comments-area").append(commentBox);
      }
    }
    /* Non-Logged-In-User */
    else if(LevoLeague.UserToken == null){
      var author_photo = "<img class=\" comment-photo \"  src=\" "+  comments[i].author_avatar+ " \" alt=\"user photo \"  >  " ;

      var name_date = "<span class=\" comment-name \"> " + comments[i].author + "    " + postDate + "</span>";

      var content = "<div class= \"comment-text \" ><div class=\"comment-text-area \"> " + comments[i].content + "</div></div> " ;

      var commentBox = '<div class="js-comment">' + author_photo + name_date + content + '</div>';
      $(".comments-area").append(commentBox);

    }

    /* Initalizes the delete button for a user's comments */
    if(i == (comments.length -1)){
      $(".js-delete-comment").live("click", function(){
        var el = $(this);
        var commentID = el.parent("div").siblings(".user-comment-id").text();
        var deleteCommentData = { id: commentID, auth_token: LevoLeague.UserToken };
        el.parent("div").parent(".js-comment").remove();
        LevoLeague.DeleteComment(deleteCommentData);
      });
    }
  }
}

LevoLeague.DisplayCommentTotal = function(comments){
  var total = comments.length;
  if(total > 1){
    $(".js-comment-count").text(total + " Comments");
  }
  else if(total == 1){
    $(".js-comment-count").text(total + " Comment");
  }
  else if(total <= 0){
    $(".js-comment-count").text(" ");
  }
}

/* Article tracking for Mixpanel */
LevoLeague.ArticleTracking = function(){
  var title = $(".title > h2").text();
  title = title.replace('>>', ' ');

  var author = $(".authorinfo > h3").text();
  author = author.replace('Author :', ' ');

  var category = $(".articles > h3.name").text();
  if  (category == ' ')
  {
    category = 'uncategorized';
  }
  else{
    category = category.replace('>>', ' ');
  }

  mixpanel.track("Article Page", {"Category": category, "Author": author, "Article Name ": title});

}

/*Share Article on Facebook */
LevoLeague.ShareOnFacebook = function(articleTitle, articleURL, commentContent, articleImg){
  var baseURL = 'https://www.facebook.com/dialog/feed/?';
  var app_id = '434794623234213';
  var text = encodeURIComponent(commentContent);
  var title = encodeURIComponent(articleTitle);
  var article = encodeURIComponent(articleURL);
  var image = encodeURIComponent(articleImg);
  var redirectURL = encodeURIComponent(document.URL);
  var url = baseURL + 'app_id=' + app_id + '&display=popup&name=' + title + '&link=' + article + '&picture=' + image + '&description=' + text + '&redirect_uri='+ redirectURL;
  window.open(url, 'facebook', 'height=400,width=580');
}
/*Share Article on Twitter */
LevoLeague.ShareOnTwitter = function(commentContent, articleURL){
  var encoded = encodeURIComponent(commentContent + ' ' + articleURL);
  var url  = "https://twitter.com/intent/tweet?text="+ encoded ;
  window.open(url, 'twitter', 'height=430,width=550' );
}



$(function(){
  LevoLeague.InitComments();  
  LevoLeague.ArticleTracking();
   
  $(".comment-share a").click(function(){
    var el = $(this);
    LevoLeague.SocialShare(el);
  });

});

