module.exports = function(grunt)
{
  'use strict';

  var scripts = require(__dirname + '/grunt/scriptGarner.js');

  grunt.initConfig
  ({
    jshint:         require('./grunt/jshint')(grunt, scripts),
    jasmine_nodejs: require('./grunt/jasmine-nodejs')(grunt)
  });

  grunt.registerTask('default', ['jshint', 'jasmine_nodejs']);
};

