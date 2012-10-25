console.log("Teachive's Curator Background");

function pickImg(){
  var img = null ;
  var pixels = 0 ;
  var width = 0;    // Current image width
  var height = 0;  // Current image height

  $('img').each(function(){
    // Get image square pixel
    var p = $(this).width() * $(this).height();
    
    // Compare with previous pixel
    if( p > pixels ){
      pixels = p ;
      img = $(this).prop('src') ;
      width = $(this).width(); // Current image width
      height = $(this).height(); // Current image height
    }
  });
  
  // Check if the current width is larger than the max
  var maxWidth = 120; // Max width for the image
  if(width > maxWidth){
    var ratio = maxWidth / width; // get ratio for scaling image
    height = height * ratio ; // Reset height to match scaled image
    width = width * ratio ; // Reset width to match scaled image
  }

  /* img whole code
  var result = '<img src="' + img + '" ' ;
  result    += 'height="' + height + '" ' ;
  result    += 'width="' + width + '" ' ;
  result    += ' align="right"/>' ;
  */
  
  // only img url
  var result = img;
  
  return result ;
}


function getContent(){
/*
  var result = $('meta[name="description"]').attr('content') ;
  
  if( !result ){
    result = $('p:first').html();
  }
*/
	var result = $('.textcontent').html();
	if(result == null){
		result = $('.post_content').html();
	}
	
	if(result == null){
		result = $('.content').html();
	}
	
	if(result == null){
		result = $('body').html();
	}
	

  return result ;
}

function getExcerpt(){

	var result = $('.textcontent').text();
	
	if(result == null){
		result = $('.post_content').text();
	}
	
	if(result == null){
		result = $('.postwrap').text();
	}
	
	if(result == null){
		result = $('.content').text();
	}
	
	if(result == null){
		result = $('body').text();
	}
	
	result = result + '';
	var max_length = 160;
	if (result.length > max_length)
		result = result.substring(0, max_length);
	result = result + '...';

  return result ;
}


chrome.extension.sendRequest({
  'title': $('title').html(),
  'url': document.URL,
  'content': getContent(),
  'img': pickImg(),
  'excerpt': getExcerpt()
});

