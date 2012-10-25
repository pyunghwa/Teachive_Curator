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

var selectedGrades = '';
var selectedSubjects = '';
var selectedSemester = '';
var selectedTopic1 = '';
var selectedTopic2 = '';
var selectedTopic3 = '';


// 
$(function() {


	//
	// Document ready
	//
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
	
	
	
	
	//
	// Compoenents Setting
	//
	var $grade_check = $("#grade_check").buttonset();
	var $subject_check = $("#subject_check").buttonset();
	var $semester_radio = $("#semester_radio").buttonset();
	//$("#topic1_combo").combobox();
	//$("#topic2_combo").combobox();
	//$("#topic3_combo").combobox();
	
	// Grade check
	$("#grade_check3").change(function(){
		//alert($("#grade_check3").attr("checked"));
		if($(this).attr("checked") == "checked")
			selectedGrades = $(this).attr("id");
		else
			selectedGrades = '';
		
		// 학년과 과목이 선택된 경우만 하위 메뉴를 보여줌
		if(selectedGrades != '' && selectedSubjects != ''){
			$("#sub_category").css({display: "block"}).show(500);
		}else{
			$("#sub_category").css({display: "none"});
		}
	});
	
	// Subejct check
	$("#subject_check4").change(function(){
		if($(this).attr("checked") == "checked")
			selectedSubjects = $(this).attr("id");
		else
			selectedSubjects = '';
		
		// 학년과 과목이 선택된 경우만 하위 메뉴를 보여줌
		if(selectedGrades != '' && selectedSubjects != ''){
			$("#sub_category").css({display: "block"}).show(500);
		}else{
			$("#sub_category").css({display: "none"});
		}
	});
	
	// Semester check
	$("#semester_radio1").change(function(){	// 1학기
		selectedSemester = $(this).attr("id");
		
	});
	$("#semester_radio2").change(function(){	// 2학기
		selectedSemester = $(this).attr("id");
		
	});
	
	// Topic1 check
	$("#topic1_combo").change(function(){
		//alert($("#topic1_combo").val());
	});
	
	
	
	
	
	
	//
	// Curating button click
	//
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
				
				// Category check
				//categories_array.push("3학년 과학 1학기");
				if($("#topic3_combo").val() != ''){
					categories_array.push($("#topic3_combo").val());
				} else if($("#topic2_combo").val() != ''){
					categories_array.push($("#topic2_combo").val());
				} else if($("#topic1_combo").val() != ''){
					categories_array.push($("#topic1_combo").val());
				} else if($("#subject_check4").attr("checked") == "checked"){
					categories_array.push("3학년 과학");
				} else if($("#grade_check3").attr("checked") == "checked"){
					categories_array.push("3학년");
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
		        
		        $('#working').html("<p id='complete'>That's been <a target='_new' href='" + edit_url + "' title='Published!'>clipped</a>!</p>");
		        		        
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