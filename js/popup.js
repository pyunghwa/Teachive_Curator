var url = '' ;
var login = '' ;
var pwd = '' ;

var post_title = '' ;
var post_url = '' ;
var post_content = '' ;
var post_img = '' ;

$(document).ready(function(){
  // If stored value not found
  url = localStorage['url'] ;
  login = localStorage['login'] ;
  pwd = localStorage['pwd'] ;

  if( !url || !login || !pwd ){
    // Open up option page
    chrome.tabs.create({url: "options.html"});
    
    // Close pop up
    window.close();
  }
  else{
    post_title = chrome.extension.getBackgroundPage().data.title ;
    post_url = chrome.extension.getBackgroundPage().data.url ;
    post_content = chrome.extension.getBackgroundPage().data.content ;
    post_img = chrome.extension.getBackgroundPage().data.img ;

    $('#destination').html( url );
    $('#post_title').html( post_title );

    var content = '' ;
    
    if( post_img ){
      $('#post_image').html( post_img );
    }
    
    if( post_content ){
      content += post_content ;
    }
    content += '\n\n <p><a href="' + post_url + '">Link</a></p>' ;
    $('#post_content').html( content );
  }
  
  $('.edit').editable(function(value, settings) { 
    console.log(this);
    console.log(value);
    console.log(settings);
    return(value);
  },{
    type:'textarea',
    submit: 'OK'
  });
  
  $('#btn_post').click(function(){
    share_post();
  });
});


function share_post(){
  var content = '<p>' + post_img + '</p>' ;
  content    += post_content ;
  content    += '<p><a href="' + post_url + '">Link</a></p>' ;

  var xml = '<?xml version="1.0"?>';
  xml += '<methodCall>';    
  xml += '<methodName>wp.newPost</methodName>';
  xml += '<params>';
  xml +=   '<param><value><int>1</int></value></param>';
  xml +=   '<param><value><string>'+ login +'</string></value></param>';
  xml +=   '<param><value><string>'+ pwd +'</string></value></param>';
  xml +=   '<param><value><struct>';
  xml +=     '<member>';
  xml +=       '<name>post_type</name>';
  xml +=       '<value><string>post</string></value>';
  xml +=     '</member>';
  xml +=     '<member>';
  xml +=       '<name>post_status</name>';
  xml +=       '<value><string>publish</string></value>';
  xml +=     '</member>';
  xml +=     '<member>';
  xml +=       '<name>post_author</name>';
  xml +=       '<value><int>1</int></value>';
  xml +=     '</member>';
  xml +=     '<member>';
  xml +=       '<name>post_title</name>';
  xml +=       '<value><string>'+ post_title +'</string></value>';
  xml +=     '</member>';
  xml +=     '<member>';
  xml +=       '<name>post_content</name>';
  xml +=       '<value><string><![CDATA['+ content +']]></string></value>';
  xml +=     '</member>';
  xml +=     '<member>';
  xml +=       '<name>comment_status</name>';
  xml +=       '<value><string>open</string></value>';
  xml +=     '</member>';
  xml +=   '</struct></value></param>';
  xml += '</params>';
  xml += '</methodCall>';

  $.ajax({
    url: url + '/xmlrpc.php',
    data: xml,
    dataType: 'xml',
    type: 'POST',
    crossDomain: true,
    contentType: 'text/xml',
    success: function(response){
      var xml = $($.parseXML(response));
      var post_id = xml.find('post_id');
      
      // If there is success code
      if( post_id ){
        // Load success page
        var msg = escape('Post published.');
        window.location.href = '/result.html?result=1&msg=' + msg ;
      }
      else{
        // Load error page
        var msg = escape('Post not published.');
        window.location.href = '/result.html?result=0&msg=' + msg ;
      }
    },
    error: function(err, status, thrown){
      switch(status){
      case 'timeout':
        var msg = escape('Not posted. Cannot connect to ' + url);
        window.location.href = '/result.html?result=0&msg=' + msg ;
        break;
        
      case 'error':
        var msg = escape('Not posted. Something wrong with ' + url);
        window.location.href = '/result.html?result=0&msg=' + msg ;
        break;

      default:
        $('.form-actions').html('Posting failed; check your setting.');
      }
    }
  });
  
  $('.form-actions').html('<img src="/img/loader.gif"> Posting...');
}


// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26538856-4']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


