/**
 * Determine the appropriate prefix for the browser running this script, one of
 * "webkit", "moz", "ms" or, failing those, the empty string "".
 * 
 * This is a little hack I adapted from David Walsh, who in turn admits having
 * lifted it from Mozilla's X-Tag codebase -- just search the computed style of
 * the documentElement for known prefixes!
 * 
 * My changes:
 * 
 * - No need to worry about the "o" prefix since Opera adopted WebKit;
 * 
 * - Only interested in the lowercase version, don't bother preparing separate
 *   CSS, DOM and JS versions;
 *   
 * http://davidwalsh.name/vendor-prefix
 * https://github.com/mozilla/x-tag
 */ 
(function( window, styles, undefined ) {
  'use strict';
  
  var NAME = 'prefix'
  
  // The prefixes we care about
  , PREFIXES = [ 'webkit', 'moz', 'ms' ]
  
  // Search the computed styles for the first matching candidate
  , PREFIX = (Array.prototype.slice.call( styles )
      .join( '' )
      .match( new RegExp( '-(' + PREFIXES.join( '|' ) + ')-' ) ) || [ '', '' ]
    )[ 1 ]
  
  ; // end var
  
  
  // Export
  window[ NAME ] = PREFIX;
  
  
})( this, this.getComputedStyle( document.documentElement ) /*, undefined */ );
