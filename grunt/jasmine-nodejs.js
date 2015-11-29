module.exports = function(grunt, scripts)
{
  'use strict';

  var jasmineNode =
  {
    options:
    {
      specNameSuffix: 'Spec.js',
      useHelpers:     false,
      stopOnFailure:  false
    },
    all:
    {
      specs: scripts.spec
    }
  };

  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  return jasmineNode;
};

