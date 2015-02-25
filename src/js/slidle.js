/**
 * !! IMPORTANT This depends on prefix.js and fullscreen.js !!
 * 
 * 
 */
(function( window, document, undefined ) {
  'use strict';
  
  // ---- Constants ----
  var NAME = 'slidle'
  , VERSION = '0.0.1'
  
  
  // Options and their default values
  , DEFAULTS = {
    show: 'json/welcome.json'
    , showDelay: 0
    , theme: 'default'
    , panel: true
    , noedit: false
    , editTheme: 'solarized_light'
    , nofull: false
    , autoHideDelay: 1618
    , autoPlayDelay: 6180
    , loop: false
  }
  
  
  // Class names (CSS)
  , CLASS_CONTAINER = NAME
  , CLASS_THEME = 'theme'
  , CLASS_FULLSCREEN = 'fullscreen'
  , CLASS_EDITING = 'editing'
  , CLASS_CANVAS = 'canvas'
  , CLASS_PANEL = 'panel'
  , CLASS_CONTROL = 'control'
  , CLASS_EDIT = 'edit'
  , CLASS_HIDE = 'hide'
  , CLASS_BUTTON = 'button'
  , CLASS_GLYPH = 'glyph'
  , CLASS_HOVER = 'hover'
  , CLASS_ACTIVE = 'active'
  , CLASS_FRAME = 'frame'
  , CLASS_FRAME_PREVIOUS = 'previous'
  , CLASS_FRAME_CURRENT = 'current'
  , CLASS_FRAME_NEXT = 'next'
  , CLASS_FRAME_VIEWER = 'viewer'
  , CLASS_FRAME_EDITOR = 'editor'
  , CLASS_ALIGN_LEFT = 'left'
  , CLASS_ALIGN_CENTER = 'center'
  , CLASS_ALIGN_RIGHT = 'right'
  , CLASS_ALIGN_JUSTIFY = 'justify'
  
  
  // Buttons in the control panel
  , CTRL_BUTTONS = {
    toggleEdit: {
      icon: [ 'chevron-up', 'chevron-down' ]
      , disabled: false
    }
    , first: {
      icon: 'fast-backward'
      , disabled: true
    }
    , previous: {
      icon: 'step-backward'
      , disabled: true
    }
    , togglePlay: {
      icon: [ 'play', 'pause' ]
      , disabled: false
    }
    , next: {
      icon: 'step-forward'
      , disabled: true
    }
    , last: {
      icon: 'fast-forward'
      , disabled: true
    }
    , toggleFull: {
      icon: [ 'resize-full', 'resize-small' ]
      , disabled: document.fullscreenEnabled !== true
    }
  }
  
  
  // Buttons in the edit panel
  , EDIT_BUTTONS = {
    insertSlide: {
      icon: 'plus'
    }
    , removeSlide: {
      icon: 'remove'
    }
    // TODO implement font choices
    /*, font: {
      icon: 'font'
    }*/
    , alignLeft: {
      icon: 'align-left'
    }
    , alignCenter: {
      icon: 'align-center'
    }
    , alignRight: {
      icon: 'align-right'
    }
    , alignJustify: {
      icon: 'align-justify'
    }
  }
  
  
  // ---- Private variables ----
  
  , instances = {}
  , anonymous = 0
  
  
  // ---- Constructor ----
  , constructor = function( container, options ) {
    
    // If first argument is a string, expect it to be a query selector
    if ( typeof container === 'string' ) {
      container = document.querySelector( container );
      if ( ! container ) {
        throw 'Failed to select slidle container with "' + options.container + '"';
      }
    }
    
    // If the container element doesn't have an id, assign a new one
    if ( ! container.id ) {
      container.id = NAME + (++anonymous);
    }
    
    if ( instances[ container.id ] === undefined ) {
      // Create a new instance if one doesn't already exist for this id
      instances[ container.id ] = new prototype.init( container, options );
    } else if ( options !== undefined ) {
      // Otherwise, if options argument is defined, re-initialize
      instances[ container.id ].init( container, options );
    }
    
    return instances[ container.id ];
    
  }
  
  
  // ---- Prototype ----
  , prototype = constructor.prototype = {
    constructor: constructor
    
    // Declare supported options and their default values
    , options: DEFAULTS
    
    // Internal state (mostly references to our DOM elements)
    , container: undefined
    , canvas: undefined
    , panel: undefined
    , controlPanel: undefined
    , controlButtons: undefined
    , editPanel: undefined
    , editButtons: undefined
    , storage: undefined
    , show: undefined
    , frames: undefined
    , views: undefined
    , editors: undefined
    , index: -1
    , isEditing: false
    , isPlaying: false
    , autoHideTimer: undefined
    , inControl: false
    , showingControl: false
    , autoPlayTimer: undefined
    
    // (Re)Initialize
    , init: function( container, options ) {
      // TODO implement recycling
      // if we are re-initializing an existing instance, we should prevent
      // memleaks by recycling already created Objects and not bind new event
      // handlers.
      
      var self = this;
      
      self.container = container;
      
      // Create instance options (with defaults in its prototype)
      self.options = Object.create( prototype.options );
      Object.keys( options ).forEach( function( key ) {
        self.options[ key ] = options[ key ];
      } );
      
      // Remove any child nodes of our container
      while ( container.lastChild ) {
        container.removeChild( container.lastChild );
      }
      
      // Apply options to container
      container.className += ' ' + CLASS_CONTAINER
                          + ' ' + CLASS_THEME + '-' + self.options.theme;
      
      // Populate the container
      self.canvas = document.createElement( 'DIV' );
      self.canvas.className = CLASS_CANVAS;
      container.appendChild( self.canvas );
      
      
      // Add buttons
      if ( self.options.panel ) {
        
        self.panel = document.createElement( 'DIV' );
        self.panel.className = CLASS_PANEL;
        container.appendChild( self.panel );
        
        
        // Populate edit panel
        self.editPanel = document.createElement( 'DIV' );
        self.editPanel.className = CLASS_EDIT;
        self.panel.appendChild( self.editPanel );
        
        self.editButtons = {};
        
        Object.keys( EDIT_BUTTONS ).forEach( function( key ) {
          var button = self.editButtons[ key ] = document.createElement( 'BUTTON' )
          , icon = EDIT_BUTTONS[ key ].icon;
          if ( typeof icon !== 'string' ) {
            icon = icon[ 0 ];
          }
          button.className = CLASS_BUTTON
                       + ' ' + CLASS_GLYPH
                       + ' ' + icon;
          self.editPanel.appendChild( button );
          
          buttonMap( button );
          
        } );
        
        [ 'Left', 'Center', 'Right', 'Justify' ].forEach( function( key ) {
          var low = key.toLowerCase();
          on( self.editButtons[ 'align' + key ], {
            'mousedown touchstart': function() {
              removeClass( self.frames[ self.index ], self.show.slides[ self.index ].align );
              self.show.slides[ self.index ].align = low;
              addClass( self.frames[ self.index ], low );
              self.saveShow();
            }
          } );
        } );
        
        on( self.editButtons.insertSlide, {
          'mousedown touchstart': function( event ) {
            if ( event.type === 'mousedown' && event.which !== 1 ) {
              return;
            }
            addClass( self.editButtons.insertSlide, CLASS_ACTIVE );
            window.setTimeout( function() {
              removeClass( self.editButtons.insertSlide, CLASS_ACTIVE );
            }, 382 );
            insertFrame( self, self.index + 1, { text: '' } );
            self.moveTo( self.index + 1 );
            self.saveShow();
          }
        } );
        
        on( self.editButtons.removeSlide, {
          'mousedown touchstart': function( event ) {
            if ( event.type === 'mousedown' && event.which !== 1 ) {
              return;
            }
            addClass( self.editButtons.removeSlide, CLASS_ACTIVE );
            window.setTimeout( function() {
              removeClass( self.editButtons.removeSlide, CLASS_ACTIVE );
            }, 382 );
            if ( removeFrame( self, self.index ) ) {
              // TODO force the animation... Ugh this is not very nice
              if ( self.index > 0 ) {
                self.index--;
                replaceClass( self.frames[ self.index ], CLASS_FRAME_PREVIOUS, CLASS_FRAME_CURRENT );
              } else if ( self.index <= self.frames.length - 1 ) {
                replaceClass( self.frames[ self.index ], CLASS_FRAME_NEXT, CLASS_FRAME_CURRENT );
              }
              self.moveTo( self.index );
              self.saveShow();
            }
          }
        } );
        
        // Populate control panel
        self.controlPanel = document.createElement( 'DIV' );
        self.controlPanel.className = CLASS_CONTROL;
        self.panel.appendChild( self.controlPanel );
        
        self.controlButtons = {};
        
        Object.keys( CTRL_BUTTONS ).forEach( function( key ) {
          // if fullscreen is disabled that is not going to change, so let's
          // not even add that button
          if ( key === 'toggleFull' && 
              (self.options.nofull || CTRL_BUTTONS[ key ].disabled) ) {
            return;
          }
          
          // likewise if options.noedit is true let's not add the edit button
          if ( key === 'toggleEdit' && self.options.noedit ) {
            return;
          }
          
          var button = self.controlButtons[ key ] = document.createElement( 'BUTTON' )
          , icon = CTRL_BUTTONS[ key ].icon;
          if ( typeof icon !== 'string' ) {
            icon = icon[ 0 ];
          }
          button.className = CLASS_BUTTON
                       + ' ' + CLASS_GLYPH
                       + ' ' + icon;
          button.disabled = CTRL_BUTTONS[ key ].disabled;
          
          buttonMap( button );
          on( button, {
            'mousedown': function( event ) {
              if ( event.which === 1 ) {
                prototype[ key ].call( self );
              }
            }
            , 'touchstart': function() {
              if ( self.showingControl ) {
                prototype[ key ].call( self );
              } else {
                restartAutoHideTimer( self );
              }
            }
            , 'touchend': function() {
              if ( ! self.showingControl ) {
                restartAutoHideTimer( self );
              }
            }
          } );
          
          self.controlPanel.appendChild( button );
          
        } );
        
      }
      
      
      // Initial values for private state
      self.isEditing = false;
      self.isPlaying = false;
      self.inControl = false;
      self.showingControl = true;
      self.storage = new window.slidle.storage();
      
      
      // Listen for resize events to show correct icon in toggleFull button
      if ( ! CTRL_BUTTONS.toggleFull.disabled ) {
        on( window, {
          'resize': function() {
            var from = self.isFull() ? 0 : 1
            , to = from ^ 1;
            removeClass( self.container, CLASS_FULLSCREEN );
            if ( from === 0 ) {
              addClass( self.container, CLASS_FULLSCREEN );
            }
            toggleIcon( self, 'toggleFull', from, to );
          }
        } );
      }
      
      // Mouse listeners on container 
      on( container, {
        'mousedown mousemove mouseup touchstart touchmove touchend': function() {
          restartAutoHideTimer( self );
        }
      } );
      
      // Mouse listeners on control panel 
      on( self.panel, {
        'mouseenter': function() {
          self.inControl = true;
          restartAutoHideTimer( self );
        }
        , 'mouseleave': function() {
          self.inControl = false;
          restartAutoHideTimer( self );
        }
      } );
      
      // Key listeners on document
      on( document, {
        'keydown': function( event ) {
          var handled = true;
          switch( event.keyCode ) {
            case 32:
              self.togglePlay();
              break;
            case 34:
            case 35: // pgdn or end
              self.last();
              break;
            case 33:
            case 36: // pgup or home
              self.first();
              break;
            case 37:
            case 38: // up or left
              self.previous();
              break;
            case 39:
            case 40: // down or right
              self.next();
              break;
            case 69: // E
              if ( event.altKey && ! self.isEditing ) {
                self.toggleEdit();
              } else {
                handled = false;
              }
              break;
            case 70: // F
              if ( event.altKey && ! self.isFull() ) {
                self.enterFull();
              } else {
                handled = false;
              }
              break;
            case 27: // Esc
              console.log('esc isediting? ' + self.isEditing + ' isFull ' + self.isFull() );
              if ( self.isFull() ) {
                self.exitFull();
              } else if ( self.isEditing ) {
                self.toggleEdit();
              } else {
                handled = false;
              }
              break;
            default:
              handled = false;
          }
          if ( handled ) {
            event.preventDefault();
          }
          //console.log( event, event.keyCode );
        }
      } );
      
      // Initialize document
      if ( self.options.show ) {
        window.setTimeout( function() {
          self.storage.fetch( self.options.show, self.setShow, self.failShow, self );
        }, self.options.showDelay );
      }
      
      return self;
    } // end init()
    
    
    , setShow: function( show ) {
      var self = this;
      self.show = {
        title: show.title
        , slides: []
      };
      
      // Make a frame for each of our slides, each with a "view" and "edit" DIV
      self.frames = [];
      self.views = [];
      self.editors = [];
      show.slides.forEach( function( slide, index ) {
        insertFrame( self, index, slide );
      } );
      self.moveTo( 0 );
      if ( self.options.panel ) {
        restartAutoHideTimer( self );
      } else {
        // if we were created without controls, start playing automatically.
        self.togglePlay();
      }
    }
    
    
    , failShow: function( url, status, statusText ) {
      window.alert( 'Failed to fetch document from ' + url
          + ': ' + status + ' (' + statusText + ')' );
    }
    
    , saveShow: function() {
      var self = this;
      self.frames.forEach( function( frame, index ) {
        var markdown = self.editors[ index ].getValue();
        self.show.slides[ index ].text = markdown.split( /\r?\n/ );
        self.views[ index ].innerHTML = window.markdown.toHTML( markdown );
      } );
      self.storage.write( self.show.title, self.show );
    }
    
    
    , moveTo: function( index ) {
      var self = this;
      if ( self.frames.length === 0 ) {
        self.index = -1;
        [ 'first', 'previous', 'togglePlay', 'next', 'last' ].forEach( function( key ) {
          removeClass( self.controlButtons[ key ], CLASS_HOVER );
          removeClass( self.controlButtons[ key ], CLASS_ACTIVE );
          self.controlButtons[ key ].disabled = true;
        } );
        
        [ 'removeSlide', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify' ].forEach( function( key )  {
          removeClass( self.editButtons[ key ], CLASS_HOVER );
          removeClass( self.editButtons[ key ], CLASS_ACTIVE );
          self.editButtons[ key ].disabled = true;
        } );
        
        
        return;
      } else {
        [ 'removeSlide', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify' ].forEach( function( key )  {
          self.editButtons[ key ].disabled = false;
        } );
      }
      
      // range check
      if ( index < 0 ) {
        index = 0;
      } else if ( index > self.frames.length - 1 ) {
        index = self.frames.length - 1;
      }
      
      // moving up
      while ( self.index < index ) {
        if ( self.index >= 0 ) {
          replaceClass( self.frames[ self.index ], CLASS_FRAME_CURRENT, CLASS_FRAME_PREVIOUS );
        }
        self.index++;
        replaceClass( self.frames[ self.index ], CLASS_FRAME_NEXT, CLASS_FRAME_CURRENT );
      }
      
      // moving down
      while ( self.index > index ) {
        replaceClass( self.frames[ self.index ], CLASS_FRAME_CURRENT, CLASS_FRAME_NEXT );
        self.index--;
        replaceClass( self.frames[ self.index ], CLASS_FRAME_PREVIOUS, CLASS_FRAME_CURRENT );
      }
      
      // update hover / active / disabled
      if ( index <= 0 ) {
        removeClass( self.controlButtons.first, CLASS_HOVER );
        removeClass( self.controlButtons.first, CLASS_ACTIVE );
        self.controlButtons.first.disabled = true;
        removeClass( self.controlButtons.previous, CLASS_HOVER );
        removeClass( self.controlButtons.previous, CLASS_ACTIVE );
        self.controlButtons.previous.disabled = true;
      } else {
        self.controlButtons.first.disabled = false;
        self.controlButtons.previous.disabled = false;
      }
      if ( index >= self.frames.length - 1 ) {
        removeClass( self.controlButtons.next, CLASS_HOVER );
        removeClass( self.controlButtons.next, CLASS_ACTIVE );
        self.controlButtons.next.disabled = true;
        removeClass( self.controlButtons.last, CLASS_HOVER );
        removeClass( self.controlButtons.last, CLASS_ACTIVE );
        self.controlButtons.last.disabled = true;
      } else {
        self.controlButtons.next.disabled = false;
        self.controlButtons.last.disabled = false;
      }
      // Restart auto play timer after a navigation event
      restartAutoPlayTimer( self );
    }
    
    
    // ---- Functions triggered by buttons in control panel; add these to our
    //      prototype so they can also be called programmatically. ----
    
    , first: function() {
      this.moveTo( 0 );
    }
    
    , previous: function() {
      this.moveTo( this.index - 1 );
    }
    
    , next: function() {
      this.moveTo( this.index + 1 );
    }
    
    , last: function() {
      this.moveTo( this.frames.length - 1 );
    }
    
    
    , toggleEdit: function() {
      var self = this
      , from = self.isEditing ? 1 : 0
      , to = from ^ 1;
      
      if ( self.options.noedit ) {
        return;
      }
      
      if ( ! self.isEditing ) {
        addClass( self.container, CLASS_EDITING );
      } else {
        removeClass( self.container, CLASS_EDITING );
        this.saveShow();
      }
      toggleIcon( self, 'toggleEdit', from, to );
      self.isEditing = ! self.isEditing;
      
      // Disable playing while editing
      if ( self.isEditing ) {
        if ( self.isPlaying ) {
          self.togglePlay();
        }
        removeClass( self.controlButtons.togglePlay, CLASS_ACTIVE );
        removeClass( self.controlButtons.togglePlay, CLASS_HOVER );
        self.controlButtons.togglePlay.disabled = true;
      } else {
        self.controlButtons.togglePlay.disabled = false;
      }
    }
    
    
    , togglePlay: function() {
      var self = this;
      var from = self.isPlaying ? 1 : 0
      , to = from ^ 1;
      toggleIcon( self, 'togglePlay', from, to );
      self.isPlaying = ! self.isPlaying;
      restartAutoPlayTimer( self );
    }
    
    , toggleFull: function() {
      var self = this;
      if ( ! self.options.nofull ) {
        if ( self.isFull() ) {
          self.exitFull();
        } else {
          self.enterFull();
        }
      }
    }
    
    , isFull: function() {
      var self = this;
      return ! self.options.nofull && self.container === document.fullscreenElement;
    }
    
    , enterFull: function() {
      var self = this;
      if ( ! self.options.nofull && ! self.isFull() ) {
        self.container.requestFullscreen();
      }
    }
    
    , exitFull: function() {
      var self = this;
      if ( ! self.options.nofull && self.isFull() ) {
        document.exitFullscreen();
      }
    }
    
  };
  
  // Hide constructor deference in prototype chain
  // I.e., ensure "window.slidle(....) instanceof window.slidle" will be true.
  prototype.init.prototype = prototype;
  
  
  // Attach some metadata
  constructor.version = VERSION;
  
  // Export
  window[ NAME ] = constructor;
  
  
  
  // ---- Private functions ----
  
  function insertFrame( self, index, slide ) {
    
    self.show.slides.splice( index, 0, slide );
    var frame = document.createElement( 'DIV' )
    , div = document.createElement( 'DIV' )
    , text = slide.text || ''
    , align = slide.align && slide.align.toLowerCase()  ||  'left'
    , editor;
    
    
    // allow an array of lines instead of a single string -- join them here
    if ( typeof text !== 'string' && typeof text.length === 'number' ) {
      text = text.join( '\n' );
    }
    
    frame.className = CLASS_FRAME + ' ' + CLASS_FRAME_NEXT;
    if ( align === 'left' ) {
      frame.className += ' ' + CLASS_ALIGN_LEFT;
    } else if ( align === 'center' ) {
      frame.className += ' ' + CLASS_ALIGN_CENTER;
    } else if ( align === 'right' ) {
      frame.className += ' ' + CLASS_ALIGN_RIGHT;
    } else if ( align === 'justify' ) {
      frame.className += ' ' + CLASS_ALIGN_JUSTIFY;
    }
    
    self.frames.splice( index, 0, frame );
    if ( index >= self.frames.length ) {
      self.canvas.appendChild( frame );
    } else {
      self.canvas.insertBefore( frame, self.canvas.children[ index ] );
    }
    div.className = CLASS_FRAME_VIEWER;
    div.innerHTML = window.markdown.toHTML( text );
    self.views.splice( index, 0, div );
    frame.appendChild( div );
    if ( ! self.options.noedit ) {
      div = document.createElement( 'DIV' );
      div.className = CLASS_FRAME_EDITOR;
      div.innerHTML = text;
      editor = window.ace.edit( div );
      editor.setTheme( 'ace/theme/' + self.options.editTheme );
      editor.setPrintMarginColumn( false );
      editor.getSession().setMode( 'ace/mode/markdown' );
      editor.getSession().setUseSoftTabs( false );
      self.editors.splice( index, 0, editor );
      frame.appendChild( div );
    }
  }
  
  function removeFrame( self, index ) {
    if ( ! window.confirm( 'Are you sure you want to remove this slide?' ) ) {
      return false;
    }
    self.show.slides.splice( index, 1 );
    self.canvas.removeChild( self.canvas.children[ index ] );
    console.log( self.frames.length );
    self.frames.splice( index, 1 );
    console.log( self.frames.length );
    if ( ! self.options.noedit ) {
      self.editors.splice( index, 1 );
    }
    // TODO find out if we can destroy() editor instances to prevent memleaks
    return true;
  }
  
  function restartAutoHideTimer( self ) {
    window.clearTimeout( self.autoHideTimer );
    removeClass( self.container, CLASS_HIDE );
    self.showingControl = true;
    if ( ! self.inControl && self.options.autoHideDelay > 0 ) {
      self.autoHideTimer = window.setTimeout( function() {
        addClass( self.container, CLASS_HIDE );
        self.showingControl = false;
      }, self.options.autoHideDelay );
    }
  }
  
  function restartAutoPlayTimer( self ) {
    window.clearTimeout( self.autoPlayTimer );
    self.autoPlayTimer = window.setTimeout( function() {
      if  ( self.isPlaying ) {
        if ( self.index >= self.frames.length - 1 ) {
          if ( self.options.loop ) {
            self.first();
          } else {
            self.togglePlay();
          }
        } else {
          self.next();
        }
      }
    }, self.options.autoPlayDelay );
  }
  
  function toggleIcon( self, key, from, to ) {
    from = CTRL_BUTTONS[ key ].icon[ from ];
    to = CTRL_BUTTONS[ key ].icon[ to ];
    replaceClass( self.controlButtons[ key ], from, to );
  }
  
  function addClass( element, clazz ) {
    element.className = element.className + ' ' + clazz;
  }
  
  function removeClass( element, clazz ) {
    element.className = element.className.replace( ' ' + clazz, '' );
  }
  
  function replaceClass( element, from, to ) {
    element.className = element.className.replace( ' ' + from, ' ' + to );
  }
  
  // jQuery style shorthand to add multiple event listeners in a single call
  function on( element, map, capture ) {
    Object.keys( map ).forEach( function( keys ) {
      keys.split( /\s+/ ).forEach( function( key ) {
        element.addEventListener( key,  map[ keys ], !! capture );
      } );
    } );
  }
  
  function buttonMap( button ) {
    on( button, {
      'mouseenter': function() {
        addClass( button, CLASS_HOVER );
      }
      , 'mouseleave': function() {
        removeClass( button, CLASS_ACTIVE );
        removeClass( button, CLASS_HOVER );
      }
      , 'mousedown': function( event ) {
        if ( event.which === 1 ) {
          addClass( button, CLASS_ACTIVE );
        }
      }
      , 'mouseup': function( event ) {
        if ( event.which === 1 ) {
          removeClass( button, CLASS_ACTIVE );
        }
      }
      , 'touchstart': function( event ) {
        event.preventDefault();
        CLASS_HOVER = ' ';
        addClass( button, CLASS_ACTIVE );
      }
      , 'touchend': function( event ) {
        event.preventDefault();
        removeClass( button, CLASS_ACTIVE );
      }
    } );
  }
  
  
} )( this, document /*, undefined */ );
