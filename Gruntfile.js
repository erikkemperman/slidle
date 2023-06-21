module.exports = function( grunt ) {

  // Project configuration.
  grunt.initConfig( {
    
    pkg: grunt.file.readJSON( 'package.json' ),
    
    clean: {
      dist: {
        files: [ {
          dot: true,
          src: [
            'js',
            'css'
          ]
        } ]
      }
    },
    
    compass: {
      compile: {
        options: {
          sassDir: 'src/scss',
          cssDir: 'css',
          importPath: 'src/scss',
          sourcemap: true,
          outputStyle: 'compressed', //expanded
          noLineComments: true
        }
      }
    },
    
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/js/*.js'
      ]
    },
    
    uglify: {
      options: {
        sourceMap: true,
        screwIE8: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        quotes: 3
      },
      build: {
        src: [
              'src/js/prefix.js'
              , 'src/js/fullscreen.js'
              , 'src/js/slidle.js'
              , 'src/js/storage.js'
        ],
        dest: 'js/<%= pkg.name %>.min.js'
      }
    },
    
    connect: {
      server: {
        options: {
          port: 8080,
          keepalive: true
        }
      }
    },
    
    watch: {
      scripts: {
        files: [ 'src/js/*' ],
        tasks: [ 'default' ],
        options: {
          spawn: true,
        },
      },
      sass: {
        files: [ 'src/scss/**' ],
        tasks: [ 'compass' ]
      }
    },
    
    concurrent: {
      serve: [ 'watch', 'connect' ],
      build: [ 'compass', 'script' ]
    }
    
  } );

  // Load tasks (use autoloader which examines package.json):
  require( 'load-grunt-tasks' )( grunt );
  
  // Default task(s):
  grunt.registerTask( 'default', [ 'clean', 'build' ] );

  // Build task
  grunt.registerTask( 'build', [ 'concurrent:build' ] );
  
  // Script task
  grunt.registerTask( 'script', [ 'jshint', 'uglify' ] );
  
  // Serve task (watch and connect)
  grunt.registerTask( 'serve', [ 'concurrent:serve' ] );
  
};

