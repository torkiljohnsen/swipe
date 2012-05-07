module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', '../../src/**/*.js']
    },
    jshint: {
      options: {
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    min: {
      dist: {
        src: '../../src/pageswipe.js',
        dest: '../../dist/pageswipe.min.js'
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint min');

};