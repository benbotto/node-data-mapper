'use strict';

module.exports = function(grunt, scripts) {
  const jasmineNode = {
    options: {
      specNameSuffix:   'Spec.js',
      useHelpers:       true,
      helperNameSuffix: 'Helper.js',
      stopOnFailure:    false
    },
    all: {
      specs: scripts.spec,
      helpers: scripts.helper
    }
  };

  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  return jasmineNode;
};

