(function( window, localStorage, undefined ) {
  
  var SLIDLE = 'slidle'
  , PREFIX = SLIDLE + '.'
  , UNTITLED = 'untitled'
  , untitled = 0
  
  , constructor = function() {
    if ( ! localStorage.getItem( SLIDLE ) ) {
      localStorage.setItem( SLIDLE, JSON.stringify( {
        list: []
        , last: ''
      } ) );
    }
  };
  
  constructor.prototype = {
    constructor: constructor
    
    , list: function() {
      return readMeta().list;
    }
    
    , last: function() {
      var meta = readMeta();
      return meta.last ? this.read( meta.last ) : null;
    }
    
    
    , fetch: function( url, success, failure, context, sync ) {
      var self = this
      , show = self.read( url )
      , request;
      if ( show ) {
        success.call( context, show );
        return;
      }
      request = new XMLHttpRequest();
      request.onload = function( event ) {
        if ( event.target.status === 200 ) {
          show = JSON.parse( event.target.responseText );
          show.title = url;
          self.write( url, show );
          if ( typeof success === 'function' ) {
            success.call( context, show );
          }
        } else if ( typeof failure === 'function' ) {
          failure.call( context, url, event.target.status, event.target.statusText );
        }
        
      };
      request.open( 'get', url, ! sync );
      request.send();
    }
    
    
    , read: function( title ) {
      touch( title );
      var json = localStorage.getItem( PREFIX + title );
      return json ? JSON.parse( json ) : null;
    }
    
    
    , write: function( title, show ) {
      touch( title );
      localStorage.setItem( PREFIX + title, JSON.stringify( show ) );
    }
    
    
    , create: function( title ) {
      if ( title === undefined ) {
        title = UNTITLED + '-' + (++untitled);
      } else if ( typeof title !== 'string' || title.length === 0 ) {
        throw 'Show title must be a non-empty string';
      }
      
      if ( this.read( title ) !== null ) {
        throw 'Show titled \'' + title + '\' already exists';
      }
      var show = {
        slides: []
      }
      , meta = readMeta();
      this.write( title, show );
      meta.last = title;
      meta.list.push( title );
      writeMeta( meta );
      return show;
    }
    
    
    , destroy: function( title ) {
      var meta = readMeta();
      meta.list = meta.list().filter( function( n ) { return n !== title; } );
      if ( meta.last === title ) {
        meta.last = meta.list.length ? meta.list[ meta.list.length - 1] : '';
      }
      writeMeta( meta );
    }
    
  };
  
  
  
  // private functions
  
  function readMeta() {
    return JSON.parse( localStorage.getItem( SLIDLE ) );
  }
  
  function writeMeta( meta ) {
    return localStorage.setItem( SLIDLE, JSON.stringify( meta ) );
  }
  
  function touch( title ) {
    var meta = readMeta();
    meta.last = title;
    writeMeta( meta );
  }
  
  
  window.slidle.storage = constructor;
  
  
} )( this, this.localStorage /*, undefined */ );
