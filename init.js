$(function(){

 // LevoLeague Init
LevoLeague.initialize = function(){

  LevoLeague.Facebook.LoadFacebook();
  LevoLeague.PopUpDisplay();

  var URL = window.location.pathname;
  var regexURL = URL.replace(/\//g, '');

  switch(regexURL)
  {
    case(""):
        LevoLeague.TwitterView();
        LevoLeague.SetHomeSlider();
        LevoLeague.HomePageTracking();
        break;

    case("home"):
        LevoLeague.TwitterView();
        LevoLeague.SetHomeSlider();
        LevoLeague.HomePageTracking();
        break;
    case("office-hours"):
      LevoLeague.OfficeHoursTracking();
      break;
  }
}

LevoLeague.initialize();

});
