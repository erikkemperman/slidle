/**
 * !! IMPORTANT This depends on utils.js and prefix.js !!
 * 
 * The Fullscreen API is gaining support by the major browsers, but we still
 * have to use prefixes... This shim makes its main features available under
 * their (likely) future standard names.
 * 
 * NOTE We can *not* implement these features in pure JS when they're not
 * provided by the browser -- for obvious reasons. So it'll only work with
 * fairly recent browsers, and maybe I shouldn't be calling it a shim.
 * 
 * Still, it does allow the rest of our code to be clean and future-proof. Plus,
 * this also means I get to write this bit as modern script; "use strict", even.
 * 
 * https://fullscreen.spec.whatwg.org/
 * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
 * 
 */
(function( window, document, documentProto, elementProto, undefined ) {
  'use strict';
  
  var PREFIX = window.prefix
  
  , REQUEST = 'Request'
  , FULL = 'Full'
  , SCREEN = PREFIX === 'moz' ? 'Screen' : 'screen'
  , EXIT = PREFIX === 'moz' ? 'Cancel' : 'Exit'
  , ELEMENT = 'Element'
  , ENABLED = 'Enabled'
  
  , standard
  
  ; // end var
  
  
  standard = 'requestFullscreen';
  if ( elementProto[ standard ] === undefined ) {
    if ( elementProto[ PREFIX + REQUEST + FULL + SCREEN ] !== undefined ) {
      Object.defineProperty( elementProto, standard, {
        value: elementProto[ PREFIX + REQUEST + FULL + SCREEN ]
      } );
    } else {
      console.warn( 'No alternative for ' + standard );
    }
  }
  
  standard = 'exitFullscreen';
  if ( documentProto[ standard ] === undefined ) {
    if ( documentProto[ PREFIX + EXIT + FULL + SCREEN ] !== undefined ) {
      Object.defineProperty( documentProto, standard, {
        value: documentProto[ PREFIX + EXIT + FULL + SCREEN ]
      } );
    } else {
      console.warn( 'No alternative for ' + standard );
    }
  }
  
  standard = 'fullscreenElement';
  if ( document[ standard ] === undefined ) {
    if ( document[ PREFIX + FULL + SCREEN + ELEMENT ] !== undefined ) {
      Object.defineProperty( document, standard, {
        get: function() { return document[ PREFIX + FULL + SCREEN + ELEMENT ]; }
      } );
    } else {
      console.warn( 'No alternative for ' + standard );
    }
  }
  
  standard = 'fullscreenEnabled';
  if ( document[ standard ] === undefined ) {
    if ( document[ PREFIX + FULL + SCREEN + ENABLED ] !== undefined ) {
      Object.defineProperty( document, standard, {
        get: function() { return document[ PREFIX + FULL + SCREEN + ENABLED ]; }
      } );
    } else {
      console.warn( 'No alternative for ' + standard );
    }
  }
  
} )( this, document, Document.prototype, Element.prototype /*, undefined */ );
