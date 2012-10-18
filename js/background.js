var data ;
console.log("Background");

chrome.extension.onRequest.addListener(
function(request, sender, sendResponse){
	console.log("chrome.extension.onRequest.addListener");
  data = request ;
});
