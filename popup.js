// Copyright (c) 2012 Pyunghwa Kim

// add click event
document.addEventListener('DOMContentLoaded', function () {
	  var sendBtn = document.querySelector('button');
	  sendBtn.addEventListener('click', makeRPCCall);
	});

  function makeRPCCall(){
	//test
	alert("ok");
    // pass multiple parms as array
    var msg = [];
    msg[0] = document.forms[0].elements["rpcserver"].value;
    msg[1] = escape(document.forms[0].elements["rpctext"].value);
    document.forms[0].elements["rpcresponse"].value = "Forwarding message thru xmlrpc-socket...";
    jsrsExecute("xmlrpc-socket.php", myCallback, "doRPC", msg);
  }
  
  function myCallback(response){
    document.forms[0].elements["rpcresponse"].value = response;
  } 
  
  function init(){
    var msg = new XMLRPCMessage('wp.getPost');
    msg.addParameter(1);
    msg.addParameter("runpeaceya");
    msg.addParameter("tepr6037");
    msg.addParameter(184);
    document.forms[0].elements[0].value = msg.xml();
  }
  
  onload=init;
  
/*
// add click event
document.addEventListener('DOMContentLoaded', function () {
	  var sendBtn = document.querySelector('button');
	  sendBtn.addEventListener('click', test);
	});


//
function test(){
	alert("aaag");
}
	
//
function makeRPCCall(){
alert("aaa");
document.write("gggg");
  var post = new XMLRPCMessage(wp.getPost);
  post.addParameter(1);
  post.addParameter("runpeaceya");
  post.addParameter("tepr6037");
  post.addParameter(184);
  
  // pass multiple parms as array
  var msg = [];
  msg[0] = "http://teachive.org/xmlrpc.php";
  msg[1] = post.xml();
  jsrsExecute("xmlrpc-socket.php", myCallback, "doRPC", msg);
 }
 
 function myCallback(response){
    document.forms[0].elements["rpcresponse"].value = response;
  } 
 
 
// send post
function sendPost(){
//  alert("zzz");
  
  //var msg = new XMLRPCMessage(wp.newPost(null));
  //alert("생성된 포스트 아이디 : "+msg);
  
  var post = new XMLRPCMessage(wp.getPost);
  post.addParameter(1);
  post.addParameter("runpeaceya");
  post.addParameter("tepr6037");
  post.addParameter(184);
}
*/


/*
var req = new XMLHttpRequest();
req.open(
    "GET",
    "http://api.flickr.com/services/rest/?" +
        "method=flickr.photos.search&" +
        "api_key=90485e931f687a9b9c2a66bf58a3861a&" +
        "text=hello%20world&" +
        "safe_search=1&" +  // 1 is "safe"
        "content_type=1&" +  // 1 is "photos only"
        "sort=relevance&" +  // another good one is "interestingness-desc"
        "per_page=20",
    true);
req.onload = showPhotos;
req.send(null);

function showPhotos() {
  var photos = req.responseXML.getElementsByTagName("photo");

  for (var i = 0, photo; photo = photos[i]; i++) {
    var img = document.createElement("image");
    img.src = constructImageURL(photo);
    document.body.appendChild(img);
  }
}

// See: http://www.flickr.com/services/api/misc.urls.html
function constructImageURL(photo) {
  return "http://farm" + photo.getAttribute("farm") +
      ".static.flickr.com/" + photo.getAttribute("server") +
      "/" + photo.getAttribute("id") +
      "_" + photo.getAttribute("secret") +
      "_s.jpg";
}
*/

