/* Looking at the source?  We're going to be hiring so why not bugfix or add new features then get in touch? 

  Github Repo: http://github.com/mclear/my
*/

var app = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
// var app = true; // TODO remove me
var step = 0; // token nasty globals
var action = ""; // one for the money
var option = ""; // two for the show..
var platform = ""; // three for the heavy now go go go 

var actions = {
  twitter: {
    label: "Twitter",
    optionText: "What is your Twitter Username?",
    placeHolder: "@johnmclear"
  },
  facebook: {
    label: "Facebook",
    optionText: "What is your Facebook Page URL?",
    placeHolder: "http://facebook.com/rung.cake24"
  },
  clone: {
    label: "Clone Rung",
    isClone: true,
    requiresString: false
  },
  website: {
    label: "Website",
    optionText: "What is the URL of the website?",
    placeHolder: "http://mclear.co.uk"
  },
  skype: {
    label: "Skype",
    optionText: "What is your Skype Username?",
    placeHolder: "JohnMcLear"
  },
  etherpad: {
    label: "Etherpad",
    optionText: "What is your Pad URL?",
    placeHolder: "http://beta.etherpad.org/p/foowie"
  },
  youtube:{
    label: "Youtube",
	optionText: "What is your Youtube Video / Channel URL?",
	placeHolder: "http://youtube.com/johnyma22"
  }
};

$(document).ready(function(){
  if(app){
    showLandingPage();
  }else{
    addActions();
  }
  $("body").on('click', "#createNew", function(){
    step = 0;
    showCompleted("landing");
	addActions();
  });
  $("body").on('click', ".action > .actionContents > .rungActions > .rungAction", function(){
    action = $(this).data("action");
    selectAction(action);
  });
  $('.option > .actionContents > form').submit(function(){
    debug("Option form submitted");
    showCompleted("option");
	if(app){ // if its the app already just write the damn tag..
	  writeTag(JSON.stringify({ // todo, ensure cloning works
        action: action,
        option: option
      }));
	}
	if(!app){ // its the mobile site
      if(readCookie("appInstalled")){ // do we have a cookie to bypass the app step?
  	    showCompleted("platform");
        showQR(); // if so then go onto showing the QR code
      }else{
        showInstallApp();	
      }
	}
    return false;
  });
  $("body").on('click', ".platforms > .paddedIcon", function(){
    platform = $(this).data("platform");
    debug("Platform is "+platform);
    showCompleted("platform");
    $("#"+platform+"Info").show();
    showInstalledApp();
    step = 3; // Platform is selected
  });
  $("body").on('click', "#continue", function(){
    debug("App is installed, need to show the generated QR Code and create a Cookie");
    createCookie("appInstalled", true, 720); // store for 720 days
    step = 4; // app is installed, just need to show QR code now
    showCompleted("platformInstall");
    showQR();
  });

  $("body").on('click', ".finish", function(){
    document.location.reload(true);
  });
  $("body").on('click', "#scan", function(){
    // Show overlay with loading..
	showCompleted("landing");
	$('.landing > .overlay').html("Starting QR Code Scanner<br/><img src='img/loading.gif'>");
    scan(); // This can take some time to execute...
  })
/*
  $("body").on('click', ".back", function(){
    debug("going back from step: "+step);
    step = step -1 ;// this is gonna be weird for non standard routes
    debug("to step: "+step);
    $(this).parent().hide(); // hide parent div
  });
*/
  setTimeout(function() {  // ghetto but required to scroll browser back to top on new load
    window.scrollTo(0, 1) }, 
  100);
});

function showLandingPage(){
  debug("Showing holding pge for app ");
  $('.landing').show();
}

function addActions(){
  // go through each item in actions and render to UI
  $.each(actions, function(key, action) {
    debug(action);
    if(!action.image){ action.image = key.toLowerCase() + ".png"; };
    $(".action > .actionContents > .rungActions").append("<a data-action="+key+" class=\"rungAction paddedIcon\"><img src=\"img/"+action.image+"\">"+action.label+"</a>");
  });
  $('.action').show();
  $('html, body').animate({
    scrollTop: $('.action').offset().top
  }, 500);
}

function selectAction(action){
  debug("Action "+action +" selected");
  showCompleted("action");
  step = 1;
  debug(actions[action]);
  if(actions[action].requiresString !== false){ // If the item requires further input
     showOption(action);
  }else{
     showInstallApp(); // Action does not require further user input
  }
}

function showOption(action){
  step = 2; // we're in the show option page
  debug("Action "+action+" requires further information so showing options form");
  $('.option').show();
  $('.option > .overlay').hide();
  var actionName = actions[action].label;
  $('.option > .actionName').text(actionName);
  $('.option > .actionContents > form > input').attr("placeholder", actions[action].placeHolder);
  $('.option > .actionContents > form > label').text(actions[action].optionText);
  $('html, body').animate({
    scrollTop: $('.option').offset().top
  }, 500);
  $('#optionInput').focus();
}

function showInstalledApp(){
  debug("showing installed app");
  $('.platformInstall').show();
  $('html, body').animate({
    scrollTop: $('.platformInstall').offset().top
  }, 500);
}

function showInstallApp(){
  // get the action and option from the dom
  var action = $('.option > .actionName').text();
  var option = $('.option > .actionContents > form > input').val();
  debug("Action frmo the form is "+action);
  debug("option from the form is "+option);
  $('.platform').show();
  $('html, body').animate({
    scrollTop: $('.platform').offset().top
  }, 500);
}

function showCompleted(step){
  debug("showing "+step+" as completed");
  $('.'+step + ' > .overlay').show();
}

function generateQR(){ // Create a QR from an API and write it to dom
  var qrInfo = {
     action: action,
     option: option
  }
  debug("Making qrCode Image for "+JSON.stringify(qrInfo));
  $('#qrCode').qrcode(JSON.stringify(qrInfo));
}


function showQR(){
  showCompleted("platform");
  if(ga){ // if ga has executed
    ga('send', 'generateQR', action, option); // send event to GA
  }
  generateQR();
  debug("generated QR for :"+action+" with the option of "+option);

  step = 5;
  $('.showQr').show();  
  debug("scrolling to showQr");
  $('html, body').animate({
    scrollTop: $('.showQr').offset().top
  }, 500);
}

function debug(msg){
  if(console && msg){
     console.log(msg);
  }
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function scan(){
  try {
    window.plugins.barcodeScanner.scan(function(args) {
      debug("Scanner result: \n" +
                    "text: " + args.text + "\n" +
                    "format: " + args.format + "\n" +
                    "cancelled: " + args.cancelled + "\n");
      /*
      if (args.format == "QR_CODE") {
      window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
      }
      */
      // document.getElementById("info").innerHTML = args.text;
	  alert("Scanned QRCode, Hold your Rung to the NFC antenna on your device now then Press Ok..  Note: It's usually on the back");
      writeTag(args.text);
    });
  } catch (ex) {
    debug(ex.text);
	alert(ex.text);
	writeTag(ex.text);
  }
}

function cloneTag(){
  nfc.addNdefListener (
    function (nfcEvent) {
      var tag = nfcEvent.tag
      var ndefMessage = tag.ndefMessage;
      // note: read code will need to decode
      // the payload from each record
      alert(JSON.stringify(ndefMessage));
      writeTag(ndefMessage);
    }, 
    function () { // success callback
      alert("Wrote Action to Rung!  Congrats!");
    },
    function (error) { // error callback
      alert("Error adding NDEF listener " + JSON.stringify(error));
    }
  );
}

function writeTag(tag){
  debug("Listening for a rung tag to which I will write"+tag);
  nfc.addNdefListener (
    function (nfcEvent) {
    var ndefRecord = ndef.uriRecord(tag.text)
    var ndefMessage = [];
    ndefMessage.push();

    nfc.write(ndefMessage, writeSuccess(tag), writeFailure(tag)); // The actual write of the tag
	
	}, 
    function () { // success callback
      alert("Waiting for rung");
    },
    function (error) { // error callback
      alert("Error adding NDEF listener " + JSON.stringify(error));
    }
  );
}

function writeSuccess(tag){
  alert("Rung successfully written, test action by holding your rung to your device");
}

function writeFailure(tag){
  alert("Failed to write, trying again");
  writeTag(tag);
}