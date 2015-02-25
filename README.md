Slidle
======

I was asked by a company, as a way of demonstrating some front-end skills, to
write a single page app to present and edit slide shows. Actually, I ended up
coding a general-purpose widget that could also be embedded in other pages.

Anyway, I had a lot of fun with it and so I decided to publish it on GitHub.

For a demonstration, please refer to http://erikkemperman.github.io/slidle --
it will load the "welcome" slideshow describing some of the features.
Do note, however, that you should NOT expect this to work on older browsers...

As of February 2015, I've tested it using these browsers on MacOSX 10.10.2:
- Chromium 38
- Safari 8
- Firefox 35
- Opera 27

It also seems to work, more or less, on mobile Safari under iOS 8.1.3.

I kind of hope it might work on IE 11, but can't test it at the moment (for lack
of Windows). If you would like to try that out, I would appreciate it if you
would let me know of any problems via the Issues section. Having said that, I
can't promise to actually fix things very quickly, since I am not sure how much
time I'll be able to spend on it.

Likewise, I would not be surprised if it sort of works on recent Androids --
especially the versions since Chrome became the default. Let me know!

Usage
-----

You'll need to include the javascript and stylesheets, obviously. Furthermore,
you should mark where the slideshow should be rendered within your HTML, and
when the page is loaded you should call the constructor. For example,

    <html>
        <head>
          
          <script src="js/slidle.min.js"></script>
          <link rel="stylesheet" href="css/slidle.css" />
          <link rel="stylesheet" href="css/theme/default.css" />
          
          <script>
            document.addEventListener( 'DOMContentLoaded', function() {
              window.slidle( '#slidle', {
                // Override option defaults here
              } );
            } );
          </script>
          
        </head>
        
        <body>
          <div id="slidle" style="width:320px;height:240px;"></div>
          
          <!-- ... -->
          
          <script src="3rd/ace/ace.js"></script>
          <script src="3rd/markdown/markdown.min.js"></script>
        </body>
        
    </html>


Options
-------
I should really document the options here, but as things are still quite fluid
I'll simply refer to the source for the time being...

Build
-----

If you would like to build yourself, you will need Node and Compass.
Assuming these are installed, proceed as follows:

Clone the repository

    git clone https://github.com/erikkemperman/slidle.git

Change into the new directory

    cd slidle

Install dependencies

    npm install

Build

    grunt build

I've included a 'serve' task which will automatically re-build if any changes
are detected and will start a local server:

    grunt serve

By default this will bind to 0.0.0.0:8080. Hit CTRL-C to kill it.
