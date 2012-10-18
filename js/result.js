$(document).ready(function(){
  var result = $.urlParam('result') ;
  switch(result){
  case '1':
    $('.alert').addClass('alert-success');
    var msg = unescape( $.urlParam('msg') );
    $('.alert').html( msg );
    break;
    
  case '0':
    $('.alert').addClass('alert-error');
    //XXX
    break ;
    
  default:
  }
  
  // Close window after 3 seconds
  window.setInterval( function(){
    window.close() ;
  }, 3000 );
});


$.urlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results[1] || 0;
}

