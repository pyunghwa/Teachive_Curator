//*******************************************************************************************************
//* jsrsClient.js - javascript remote scripting client 
//*   
//*  Make asynchronous remote calls to server (functions) *without* client page refresh.
//*
//* Intro: [by Brent Ashley]
//*  Javascript Remote Scripting (JSRS) is a client-side javascript library which uses Dynamic HTML 
//*  elements to make hidden remote procedure calls to the server. 
//*  When traditional web applications exchange data with the server, the current page is replaced, 
//*  causing a redraw of the display and disruption of application flow. Many applications are forced 
//*  to be drawn out along a series of wizard steps rather than dealt with on a single form. 
//*   
//* How to use: See jsrsCore.js
//* 
//* 
//* Note: There 2 ways to pass the data GET(default) and POST;
//*       Controled by global var: jsrsContextProp.useGet = [true|false]
//*       A) GET (by passing the data with the URL through dynamically added javascript include tag) 
//*       B) POST (by setting up a form in the hidden iframe and submitting it)
//*   
//*       Method A) is limited by the max URL length (2k ?) but seams to work smoothly.
//*       Method B) has a much higher limit but can have some side effects.
//*      
//* Note: WDDX (default is squeezed WDDX) as data interface between the client and server
//*       Controled by global var: jsrsContextProp.compressWDDX = [true|false] either 
//*       a normal WDDX or proprietary squeezed WDDX format is used to pass the parameter 
//*       data. In this way it's posable to pass complex data transparently.
//* 
//* How it works (Internals):
//*                      CLIENT Browser                                          SERVER
//*          +-------------------------------------+
//*          |     Your HTML Page                  |                         +-------------------------
//*          |               +- - - - - - - - - -+ | Call URL(pass param +ID)| JSRS-Server-Page
//*          |          +--->�Hidden doc.        �-------------------------->|   Use param's to call remote     
//*          |          |    � (iframe)          �<--------------------------|   function and return data
//*          |          |    +- - - - - - - -+- -+ | Page returns data +ID   |   with js that triggers the 
//*          +--------- | -------------------|-----+                         |   jsrsReturn() in client
//*                     |                    |                               |
//*            Dynamicaly create a    Returned page calls the                +------------------------                     
//*            logical 'container'  jsrsReturn(ID, ret, errTxt) function 
//*                     |                    |
//*                     |      JSRS Lib      |
//*                +----^--------------------v-------------+                   
//* jsrsCall(...)  |new JsrsContext(ID)      |             |
//*  ------------->+--+                      |             |
//*                |      Find the matching JsrsContext    |        
//*  <-------------+----- Get ret. data from 'container'   |
//*  Your          |      Call callback with data          |
//*  js-callback   +---------------------------------------+                      
//*   
//* Dependences: jsrsCore.js
//*   
//* See license.txt for copyright and license information
//* ------------------------------------------------------------------------------------------------------
//* @Requires NS6.2 and up / IE5.5 and up / Don't know about Opera
//* ------------------------------------------------------------------------------------------------------
//* @Version: 3.0 (10-April-2002) ($Revision: 1.3 $)
//* See history.txt for full history
//* ------------------------------------------------------------------------------------------------------
//* @Author:  Sam   Blum   [jsrs@4matics.ch] Collected all the ideas, merged and rewrote them and added doc.
//*   Inspired by:  Brent Ashley [jsrs@megahuge.com] initial Autor of jsrs V1 and V2. See http://ashleyit.com/rs/main.htm
//*   Inspired by:  Danne Lundqvist  [dotvoid@dotvoid.com] remote call *without* iframe
//*   Inspired by:  Eric Costello see http://www.oreillynet.com/pub/a/javascript/2002/02/08/iframe.html
//*   Inspired by:  Nate Weiss [nweiss@icesinc.com]  See www.wddx.org
//* ------------------------------------------------------------------------------------------------------
//* @Copyright see license.txt for copyright and license info
//*******************************************************************************************************

// ============================================================================ 
//  -- Global Properties -- 
// ============================================================================ 
// jsrsContextProp needs global scope.
var jsrsContextProp = new Object;
jsrsContextProp.poolSize = 0;                   // Current amount of running calls (we're awaiting to finish)
jsrsContextProp.maxPool  = 10;                  // Max parallel running calls
jsrsContextProp.pool     = new Array();         // Array of context object used for the running calls
jsrsContextProp.browser  = _jsrsBrowserSniff(); // Detect what browser we're using.
jsrsContextProp.useGet   = true;                // If TRUE, pass params by GET (instead of POST) 
jsrsContextProp.alertErr = true;                // alert if error occurs on return of the remote call             
jsrsContextProp.compressWDDX = true;            // Compress WDDX when passing data to and from the server to reduce (URL-)length

jsrsContextProp.Serializer = new WddxSerializer();
jsrsContextProp.Deserializer = new WddxDeserializer();


// ============================================================================ 
//  -- Public Remote Call Functions  -- 
// ============================================================================ 

//************************************************************************
//* Simple Remote Call (Your 'Entry Point' as user of this lib)
//*
//* This is the only function you call from your js code.  
//*
//* @access public
//* @param  remoteTarget [string] The target href. Must come frome same domain as the page (Browser limitaion)
//* @param  callback [string] js-function to call on return or null to ignor return. 
//*           js-function must accept single param (the returned string).
//* @param  remoteFunction [string] The remote function to call (optional, default= ???) 
//* @param  params [string OR array of strings]  (optional)
//* @param  visibility [bool] (optional, default=false) To make container visible for debugging
//* @return [string OR bool] On success the context-ID is returned. Otherwise FALSE.
//**
function jsrsCall(remoteTarget, callback, remoteFunction, params, visibility){
  if (!document.createElement) {
    alert('Sorry, JSRS will not work with this browser (to old). It missing the DOM funktionality.');
    return false;
  }
  // Look for free context
  var freeContext = false;
  for (var i=1; i <= jsrsContextProp.poolSize; i++){
    contextObj = jsrsContextProp.pool['jsrs' + i];
    if (!contextObj.busy){
      contextObj.busy = true;      
      freeContext = contextObj;
      break; // Got a free one break. 
    }
  }
  
  if (!freeContext && (jsrsContextProp.poolSize <= jsrsContextProp.maxPool)) {
    // Create new context if all are full and max is not reached 
    jsrsContextProp.poolSize++;
    var contextID = 'jsrs' + jsrsContextProp.poolSize;
    freeContext = jsrsContextProp.pool[contextID] = new JsrsContext(contextID);
  }
  
  if (freeContext) {
    // Convert the params to WDDX format
    params = jsrsContextProp.Serializer.serialize(params);
    
    // Compress WDDX in propriatery way (URL length is limited)
    if (jsrsContextProp.compressWDDX) {
      params = _WddxHelper.squeeze(params);
    }

    if (visibility) freeContext._setVisibility(true);
    if (jsrsContextProp.useGet){
      freeContext._remoteCall_GET(callback, remoteTarget, remoteFunction, params);
    } else {
      freeContext._remoteCall_POST(callback, remoteTarget, remoteFunction, params);
    }  
    return freeContext.id;
  } else {
    alert( "jsrs Error: context pool full (Max is :"+jsrsContextProp.maxPool+")" );
    return false;
  }

}


// ============================================================================ 
//  -- Remote Return (Trigger) Functions -- 
// ============================================================================ 

//************************************************************************
//* This function is to be triggered by the remote call's returnd data 
//*
//* As a reaction to the remote call the returned data must contain a js call to 
//* this function passing the context ID and return data (as WDDX). 
//* If an error occured the 3rd parameter will be set with an error text.
//* Using the context ID we 
//*  a) can lookup if we have to execute a callback function (passing the returned data) 
//*  b) know the call was carried out (freeing the 'busy' context)
//* 
//* @access private (for the client, but public for the server) 
//* @param  contextID [int or string] Used to identify the context
//* @param  ret       [string] escaped WDDX string
//* @param  errText   [string] If empty SUCCESS otherwise ERROR 
//* @see jsrsError()
//**
function jsrsReturn(contextID, ret, errText){
  var contextObj = jsrsContextProp.pool[contextID]; // get context object
  if (errText && (errText.length > 0)) {
    errText = errText.replace(/\+/g, ' ');
    errText = unescape(errText);
    if (jsrsContextProp.alertErr) alert('Error: '+errText); // Failer returned 
  } else {    
    if(contextObj.callback){ // invoke callback
      ret = ret.replace(/\+/g, ' ');
      ret = unescape(ret); 
      contextObj.ret = ret; 
      if (jsrsContextProp.compressWDDX) ret = _WddxHelper.expand(ret);
      ret = jsrsContextProp.Deserializer.deserialize(ret);
      // The callback is a little tricky, so I used a separate fucntion to do the job
      _callback(contextObj.callback, ret, contextID);
    }
  }
  // clean up and return context to pool
  contextObj.callback = null;
  contextObj.busy = false;
  if (elem = document.getElementById(contextObj.script.id)) {
    contextObj.head.removeChild(elem);
    contextObj.script.src = "";
  }
}

// ============================================================================
//  -- The Context Class -- 
// ============================================================================

//***********************************************************************
//*  Class JsrsContext
//************************************************************************
//* The context class is a wrapper for calls and it's return data
//*   Because we have asynchronous calls we can have multiple calls at the 
//*   *same* time running. Thus when the retuned data comes in we have to 
//*   have a way to identify from which call it was triggered. 
//*   This is managed with an contextID that is passed with the call and 
//*   is expected to be attached to the retuned data.
//* 
//*   Note I: The amount of parallel running calls is limited by jsrsContextProp.maxPool
//*
//* @access private 
//* @param  contextID [int or string] Used to identify the context
//**
function JsrsContext(contextID){

  //************************************************************************
  //* Trigger a call to the server using the GET method (appending params to the URL).
  //*
  //* Note: Because URL is limited in length (max 2k ??) this method will 
  //*       compress the WDDX structure if jsrsContextProp.compressWDDX is TRUE. 
  //*       This can save up to 80% in length!
  //*       The server will uncompress the data before deserializing the WDDX stream
  //* 
  //* @access private 
  //* @param  callback [string] js-function to call on return or null to ignore return. 
  //*           js-function must accept single param (the returned string).
  //* @param  remoteTarget [string] The target href. Must come from same domain as the page (Browser limitation)
  //* @param  remoteFunction [string] The remote function to call (optional, default= ???) 
  //* @param  params [string] (optional) WDDX data string.
  //**
  this._remoteCall_GET = function (callback, remoteTarget, remoteFunction, params){
    this.callback = callback;
    var url = new Array(); var b = 0;
    
    url[b++] = remoteTarget;                               // Start building url[b++] to call
    url[b++] = (remoteTarget.indexOf('?')>=0) ? '&' : '?'; // Check if query param are already added 
    
    var d = new Date(); // unique string to defeat cache
    url[b++] = "jsrsU=" + d.getTime()+ '' + Math.floor(1000 * Math.random());
    url[b++] = "&jsrsC=" + this.id;       // Add send context ID
    url[b++] = "&jsrsR=js";               // Mark that return is to be javascript (not html)
    if (jsrsContextProp.compressWDDX) url[b++] = "&jsrsZ=zip"; // Mark that the squeezed-WDDX is to be used 
    
    if (remoteFunction != null){ // remoteFunction and params are optional
      url[b++] = "&jsrsF=" + escape(remoteFunction);
      if (params != null) {
        // Note: Preferred to only replace '%' and '&' instead of escape(params). Result is a 25% shorter query :)
        url[b++] = "&jsrsP=" + params.replace(/%/g,'%25').replace(/&/g,'%26');
      }
    } // remoteFunction
    
    this.script.src = url.join('');
    this.head.appendChild(this.script);
  };

  
  //************************************************************************
  //* Trigger a call to the server using the POST method (using a HTML form).
  //* 
  //* @access private 
  //* @param  callback [string] js-function to call on return or null to ignore return. 
  //*           js-function must accept single param (the returned string).
  //* @param  remoteTarget [string] The target href. Must come from same domain as the page (Browser limitation)
  //* @param  remoteFunction [string] The remote function to call (optional, default= ???) 
  //* @param  params [string] (optional) WDDX data string.
  //**
  this._remoteCall_POST = function (callback, remoteTarget, remoteFunction, params){
    this.callback = callback;

    var d = new Date(); // unique string to defeat cache
    var unique = d.getTime() + '' + Math.floor(1000 * Math.random());
    var out = new Array(); var b = 0;
    
    out[b++] = '<html><body>';
    out[b++] = '<form name="jsrsForm" method="post" target="" ';
    out[b++] = 'action="' + remoteTarget + '?jsrsU=' + unique + '">';
    out[b++] = '<input type="hidden" name="jsrsC" value="' + this.id + '">';
    out[b++] = '<input type="hidden" name="jsrsE" value="esc">'; // Mark that the passed data is escaped 
    if (jsrsContextProp.compressWDDX) out[b++] = '<input type="hidden" name="jsrsZ" value="zip">'; // Mark that the squeezed-WDDX is to be used 
    
    // remoteFunction and params are optional
    if (remoteFunction != null){
      out[b++] = '<input type="hidden" name="jsrsF" value="' + remoteFunction + '">';
      if (params){
        out[b++] = '<input type="hidden" name="jsrsP" value="' + escape(params) + '">';
      } // params
    } // remoteFunction
  
    out[b++] = '</form></body></html>';
    
    this.out = out.join('');
    _callToServer(this.id);
  };    


  //************************************************************************
  //* Creates the hidden container used by this context to receive the server 
  //* data that was trigger by a call.
  //*
  //* @access private 
  //**
  this._createContainer = function() {
    var container = null;
    switch(jsrsContextProp.browser) {
      case 'IE':
        document.body.insertAdjacentHTML( "afterBegin", '<span id="SPAN' + this.id + '"></span>' );
        var span = document.all( "SPAN" + this.id );
        span.innerHTML = '<iframe name="' + this.id + '" src=""></iframe>';
        span.style.display = 'none';
        container = window.frames[this.id];
        container.theDoc = container.document;
        break;
      case 'MOZ':  
        var span = document.createElement('SPAN');
        document.body.appendChild( span );
        var iframe = document.createElement('IFRAME');
        iframe.name = this.id;
        iframe.width = 0; iframe.height = 0;
        span.appendChild( iframe );
        container = iframe;
        break;
    }
    
    this.container = container;
  };
  
  //************************************************************************
  //* For debugging: To make container visible 
  //* @access private
  //* @param vis [bool] true = make visable (default = false)
  //**
  this._setVisibility = function (vis){
    switch( jsrsContextProp.browser ) {
      case 'IE':
        document.all("SPAN" + this.id ).style.display = vis ? '' : 'none';
        break;
      case 'MOZ':
        document.getElementById("SPAN" + this.id).style.visibility = vis ? '' : 'hidden';
        this.container.width = vis ? 250 : 0;
        this.container.height = vis ? 100 : 0;
        break;
    }  
  };

  // properties
  this.id = contextID;   // The context ID
  this.busy = true;      // Flag is true when waiting for call to return data
  this.callback = null;  // The js-function to call on return of the call
  
  // code (of constructor)
  // Create the IFrame container (for POST connection)
  this._createContainer(); 
  
  // Prepare the script tag (for GET connection)
  this.head = document.getElementsByTagName('head').item(0);
  this.script = document.createElement('script');
  this.script.type = 'text/javascript';
  this.script.id = "SCRIPT_"+this.id;
  this.script.defer = true;
} // END Class JsrsContext
 

// ============================================================================ 
//  -- Helpers -- 
// ============================================================================ 

//************************************************************************
//* This function submits the prepared form to the server when using 
//* POST (instead of GET) to pass the parameters.
//* 
//* Note: We have to give NS6 a fraction of a second to recognize the IFrame
//*       we created.
//* 
//* @access private
//* @param  contextID [string] The ID of the context object used 
//**
function _callToServer(contextID) {
  var doc;
  contextObj = jsrsContextProp.pool[contextID];
  if (jsrsContextProp.browser=='MOZ') {
    if (!(contextObj.container.contentDocument)) {
      setTimeout('_callToServer("'+contextID+'")', 20);
      return;
    }
    contextObj.container.document = contextObj.container.contentDocument;
  }
  doc = contextObj.container.document; 
  doc.open();
  doc.write(contextObj.out);
  doc.close();
  doc.forms['jsrsForm'].submit();
}

//************************************************************************
//* Execute the callback function. 
//* Situation: Server has successfully returned and the callback function 
//*            has to be evaluated from the given callback-Str and called.
//* Problem:   If the callback-Str is a methode (not just a simple function)
//*            E.g.  "myObject.method"
//*            JS sucks in this case! It forces us to *first* evaluate the 
//*            myObject and then execute the methode. Otherwise 'this' will
//*            not be set properly. 'this' will then be this window and not
//*            the myObject (can't go in more detail , sorry). 
//* @access private
//* @param  callbackStr [string] The callback-str of the form 'foo' or 'foo.bar' 
//* @param  retVal [mixed] The return value from the server
//* @param  contextID [string] The ID of the context object used 
//**
function _callback(callbackStr, retVal, contextID) {
  var ret;
  if (callbackStr.indexOf('.') >= 0) {
    var tmp = callbackStr.split('.');
    var theObject = eval(tmp[0]);
    ret = theObject[tmp[1]](retVal, contextID);
  } else {
    var theFunction = eval(callbackStr);
    ret = theFunction(retVal, contextID);
  }
  return ret;
}


//************************************************************************
//* Determine browser type
//**
function _jsrsBrowserSniff(){
  if (document.all) return "IE";
  if (document.getElementById) return "MOZ";
  return "OTHER";
}

//************************************************************************
//* Compress / Uncompress WDDX data stream
//*  WDDX can be easily compressed to 20% of it's size.
//*  Don't understand way does WDDX guys didn't use a shorthand notation like 
//*  str / num (instead of string / number) in the first place. 
//**
function _WddxHelper(){
  var squeezList = new Object;
  squeezList['<r t'] = /<struct type/g;
  squeezList['<r>']  = /<struct>/g;
  squeezList['</r>'] = /<\/struct>/g;
  squeezList['<a l'] = /<array length/g;
  squeezList['</a>'] = /<\/array>/g;
  squeezList['<v n'] = /<var name/g;
  squeezList['</v>'] = /<\/var>/g;
  squeezList['<b v'] = /<boolean value/g;
  squeezList['<s>']  = /<string>/g;
  squeezList['</s>'] = /<\/string>/g;
  squeezList['<n>']  = /<number>/g;
  squeezList['</n>'] = /<\/number>/g;
  squeezList['<dT>'] = /<dateTime>/g;
  squeezList['</dT>']= /<\/dateTime>/g;
  this.squeezList = squeezList;
  
  var expandList = new Object;
  expandList['<struct type'] = /<r t/g;
  expandList['<struct>']   = /<r>/g;
  expandList['</struct>']  = /<\/r>/g;
  expandList['<array length'] = /<a l/g;
  expandList['</array>']   = /<\/a>/g;
  expandList['<var name']  = /<v n/g;
  expandList['</var>']     = /<\/v>/g;
  expandList['<boolean value'] = /<b v/g;
  expandList['<string>']   = /<s>/g;
  expandList['</string>']  = /<\/s>/g;
  expandList['<number>']   = /<n>/g;
  expandList['</number>']  = /<\/n>/g;
  expandList['<dateTime>'] = /<dT>/g;
  expandList['</dateTime>']= /<\/dT>/g;
  this.expandList = expandList;
  
  this.squeeze = function(stream) {
    for (subst in this.squeezList) {
      stream = stream.replace(this.squeezList[subst], subst);
    }
    return stream;  
  };
  
  this.expand = function(stream) {
    for (subst in this.expandList) {
      stream = stream.replace(this.expandList[subst], subst);
    }
    return stream;  
  };

}
_WddxHelper = new _WddxHelper(); // Pseudo static


//************************************************************************
//* Use for debugging by attaching to F1 (works with IE)
//* with onHelp = "return jsrsDebugInfo();" in the body tag
//**
function jsrsDebugInfo(){
  var out = new Array(); var b = 0;
  out[b++] = 'Pool Size: ' + jsrsContextProp.poolSize + '<br><font face="arial" size="2"><b>';
  for( var i in jsrsContextProp.pool ){
    var contextObj = jsrsContextProp.pool[i];
    var doc = contextObj.container.document;
    var script = contextObj.script;
    var used_GET = script.src.length ? true : false; 
    var url, uri, serverReturn;
    
    if (used_GET) {
      var tmp = script.src.split('?');
      url = tmp[0];
      uri = '?'+tmp[1];
      serverReturn = (!contextObj.ret) ? '-- No respons from Server --' : contextObj.ret.replace(/</g,'&lt').replace(/>/g,'&gt');
    } else {
      url = doc.location.pathname;
      uri = doc.location.search;
      serverReturn = (!doc.body.innerHTML) ? '-- No respons from Server --' : doc.body.innerHTML;
    }
     
    var table = new Object();
    table['Context-ID'] = contextObj.id + ' : ' + (contextObj.busy ? 'busy' : 'available');
    table['Target URL'] = unescape(url);
    table['URI readable'] = unescape(uri).replace(/</g,'&lt').replace(/>/g,'&gt');
    table['Sent URL'] = url + uri;
    
    out[b++] = '<hr><b>Call via ' + (used_GET ? 'GET' : 'POST') + '</b>';
    out[b++] = '<TABLE border="1">';
    for(cap in table) {
      out[b++] = '<TR><TD>'+cap+':</TD><TD>'+table[cap]+'</TD></TR>';  
    }
    out[b++] = '</TABLE><br>';

    out[b++] = 'Returned Content  : ';
    out[b++] = '<table border="1"><tr><td>';
    out[b++] = serverReturn;
    out[b++] = '</td></tr></table>';
  }
  out[b++] = '</table>';
  
  var doc = window.open().document;
  doc.open;
  doc.write(out.join('\n'));
  doc.close();
  return false;
}

