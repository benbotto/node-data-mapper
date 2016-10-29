module.exports = function(grunt) {
  'use strict';

  const VERBOSE = false;
  const scripts = (require('./grunt/scriptGarner.js'))(VERBOSE);

  grunt.initConfig({
    jshint:         require('./grunt/jshint')(grunt, scripts),
    jasmine_nodejs: require('./grunt/jasmine-nodejs')(grunt, scripts),
    watch:          require('./grunt/watch')(grunt, scripts)
  });

  grunt.registerTask('default', ['jshint', 'jasmine_nodejs']);
};

