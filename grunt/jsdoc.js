'use strict';

module.exports = function(grunt, scripts) {
  const jsdoc = {
    dist: {
      src:  scripts.app,
      dest: 'doc'
    }
  };

  grunt.loadNpmTasks('grunt-jsdoc');

  return jsdoc;
};

