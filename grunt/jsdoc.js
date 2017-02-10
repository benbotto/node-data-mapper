'use strict';

module.exports = function(grunt, scripts) {
  const jsdoc = {
    dist: {
      src:     scripts.app,
      options: {
        destination: 'doc',
        recurse:     true,
        tutorials:   './tutorial'
      }
    }
  };

  grunt.loadNpmTasks('grunt-jsdoc');

  return jsdoc;
};

