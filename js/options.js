$(document).ready(function(){
  // Load values
  $('#input_url').val( localStorage['url'] );
  $('#input_login').val( localStorage['login'] );
  $('#input_pwd').val( localStorage['pwd'] );
  
  $('#btn_save').click(function(){
    // Save values
    localStorage['url'] = $('#input_url').val();
    localStorage['login'] = $('#input_login').val();
    localStorage['pwd'] = $('#input_pwd').val();
  });
});

