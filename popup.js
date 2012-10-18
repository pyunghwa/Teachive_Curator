// Curator for Teachive.org
// Pyunghwa Kim

/* Shit!!
console.log("chrome.browserAction.onClicked.addListener");
chrome.tabs.executeScript(null, {file: "content_script.js"});
*/

var username = '';
var password = '';
var endpoint = '';

var post_title = '' ;
var post_url = '' ;
var post_content = '' ;
var post_img = '' ;
var post_excerpt = '';


// 
$(function() {

	// Document ready
	$(document).ready(function(){	
	
		// User information from option
		username = localStorage["username"];
		password = localStorage["password"];
		endpoint = localStorage["endpoint"];
		
		// User information check
		if( !username || !password || !endpoint ){
			// Open up option page
			chrome.tabs.create({url: "options.html"});
			
			// Close pop up
			window.close();
			
		 } else{

			// Get clipping data from background
			post_title = chrome.extension.getBackgroundPage().data.title;
			post_url = chrome.extension.getBackgroundPage().data.url;
			post_content = chrome.extension.getBackgroundPage().data.content;
			post_img = chrome.extension.getBackgroundPage().data.img;
			post_excerpt = chrome.extension.getBackgroundPage().data.excerpt;
			
			// Display clipping data
			$('#post_title').attr("value",post_title); // Title
			// Thumbnail image
			var thumbnail_img = "<img src="+post_img+" width='120' />";
			$('#preview_image').html(thumbnail_img); 
			$('#preview_text').html(post_excerpt);// Excerpt
		
		}
});

	
	
	// Curating button click
	$('#go_add_link').click(function(){
	
		//Add a spinner, to suggest something is happening
		$('#working').show().html("<img src='loading.gif' alt='' />");
		
		// Shit!!
		// get current tab source
		/*
		var alltext = "";
		chrome.extension.onConnect.addListener(function(port) {
			console.log("chrome.extension.onConnect.addListener");
			var tab = port.sender.tab;

			// This will get called by the content script we execute in
			// the tab as a result of the user pressing the browser action.
			port.onMessage.addListener(function(info) {
				console.log("port.onMessage.addListener");
				//var max_length = 1024;
				//if (info.selection.length > max_length)
				//	document.getElementById("post_comment").value = info.selection.substring(0, max_length);
				alltext = info.selection;
			});
		});
		*/
		
		
		//We first need to get the URL of the page we're on
		chrome.tabs.getSelected(null,function(tab) {
		    
		    //var tablink = tab.url;
		    
		   	EW.LogSystem.init(); //you can open the console by pressing ALT + D (in Firefox > 2.0 press SHIFT+ALT+D) 
				
			function AddBlogsListener(){            
			}
	
			AddBlogsListener.prototype.connRequestError = function(errorMsg){
			    EW.LogSystem.error("AddBlogsListener.connRequestError");
			}
	
			AddBlogsListener.prototype.connRequestStopped = function(){
			    EW.LogSystem.debug("AddBlogsListener.connRequestStopped");
			}
	
			AddBlogsListener.prototype.connRequestCompleted = function(userBlogs){
			    EW.LogSystem.debug("AddBlogsListener.connRequestCompleted");
			}
	
		    try {

				var category_name = localStorage["category_name"];
				var categories_array = [];
				var e_post_type = localStorage["post_type"];
				
				var set_schedule_date_time = document.getElementById("schedule_date_time");
				var e_schedule_date_time = set_schedule_date_time.value;
				
				// Schedule check
				if(e_schedule_date_time != ""){
					var schedule_date = new Date(e_schedule_date_time);
				}
				
				// Title check
				if(post_title == "" || post_title == null){
					post_title = post_url;
				}
				
				// Post type check
				if(e_post_type !== ""){
					set_post_type = e_post_type;
				}else{
					set_post_type = "post";
				}
				
				// Tags check
				var tags_array = [];
				var set_tags = document.getElementById("post_tags");
				var e_set_tags = set_tags.value;
				
				if(e_set_tags != ""){
					
					split_the_tags_pre = e_set_tags.replace(/^\s+|\s+$/g, '');
					split_the_tags = split_the_tags_pre.split(",");
					
					for(var i in split_the_tags){
						tags_array.push(split_the_tags[i]);
					}
				}
				
				// Post content check
				if(post_content == null) {
					post_content = "";
				}

				// Custom Fields
				var custom_fields_array = [];
				var custom_fields_featuretext = { key: "featuretext", value: document.getElementById('post_comment').value }; // featuretext
				var custom_fields_featureimage = { key: "featureimage", value: post_img }; // featureimage
				var custom_fields_featureurl = { key: "featureurl", value: post_url }; // featureurl
				
				custom_fields_array.push(custom_fields_featuretext);
				custom_fields_array.push(custom_fields_featureimage);
				custom_fields_array.push(custom_fields_featureurl);
				
				
				// METAWEB API - Final!!
				var content = { title: post_title, description: post_content, categories: categories_array, mt_keywords: tags_array, post_type: set_post_type, custom_fields: custom_fields_array };
				
				// WP API
				//var content = { post_title: post_title, post_content: content_for_post, post_type: set_post_type, custom_fields:custom_fields_array };
				
				console.log(content.custom_fields.key+":"+content.custom_fields.value);
				
				
				/* Exclude Schedule and Link type
				if(category_name && (category_name != "")){
					
					//A category name has been entered, so use that
					categories_array.push(category_name);
					
					//Scheduled dates
					if(schedule_date){
					
						var content = { title: post_title, description: content_for_post, categories: categories_array, mt_keywords: tags_array, post_type: set_post_type, dateCreated: schedule_date };
					
					}else{
					
						var content = { title: post_title, description: content_for_post, categories: categories_array, mt_keywords: tags_array, post_type: set_post_type };
					
					}
					
				}else{
				
					//No category name selected, so try and use the post format 'link'
					
					//Scheduled dates
					if(schedule_date){
					
						var content = { title: post_title, description: content_for_post, wp_post_format: "link", mt_keywords: tags_array, post_type: set_post_type, dateCreated: schedule_date };
					
					}else{
					
						var content = { title: post_title, description: content_for_post, wp_post_format: "link", mt_keywords: tags_array, post_type: set_post_type };
					
					}
					
				}
				*/
				
				var edit_url_pre = endpoint.replace("xmlrpc.php","");
				var edit_url = edit_url_pre + "wp-admin/edit.php";
				
		        var connection = new NewPost(username , password, endpoint, content);
		        connection.addListener(new AddBlogsListener());
		        connection.startConn();
		        
		        $('#working').html("<p id='complete'>Awesome! That's been <a target='_new' href='" + edit_url + "' title='Published!'>published</a>!</p>");
		        		        
		    } 
		    catch (error_obj) {
				 //EW.LogSystem.error("showErrorDialog: "+error_obj.name + "--" + error_obj.message);
				 //alert("showErrorDialog: "+error_obj.name + "--" + error_obj.message);
				 $('#container').append("<p>"+error_obj.name + "--" + error_obj.message+"</p>");	
		    }
		    
		});
	
	});
	
	
	// Get date
	$('#schedule_date_time').datetime({ format: "yy-mm-dd'T'hh:ii" });
	
	// Schedule slide motion
	$('#schedule').slideUp();
	
	// Schedule click
	$('.schedule_link').click(function(){
	
		$('#schedule').slideToggle();
	
	});
	
	
	// Title at current tab
	/*
	chrome.tabs.getSelected(null,function(tab) {
	
		if(tab.title){
			var tabtitle = tab.title;
		}else{
			var tabtitle = "";
		}
		
		if(tabtitle != ""){
			//$('#post_title').attr("value",tabtitle);
		}
	
	});
	*/

});


// Check box for Category
function clickElementaryCheckbox(event)
{
	var check1st = false;
	var check2nd = false;
	var check3rd = false;
	var check4th = false;
	var check5th = false;
	var check6th = false;
	
	alert("Aaaaaaa" + event.target.value);
	
	if(event.target.id == "grade_elementaty_1") {
		if(check1st == false) {
			document.getElementById('subjects_korean').disabled = true;
			document.getElementById('subjects_korean').checked = true;
			//#subjects_math
			//#subjects_goodlife
			//#subjects_wiselife
			//#subjects_funlife
			//#subjects_ethic
			//#subjects_society
			//#subjects_science
			//#subjects_physical
			//#subjects_music
			//#subjects_art
			//#subjects_english
			//#subjects_practical
			check1st = true;
		}else {
			check1st = false;
		}
	}
			
}