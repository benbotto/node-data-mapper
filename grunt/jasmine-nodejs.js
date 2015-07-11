module.exports = function(grunt)
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
      specs: ['spec/**']
    }
  };

  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  return jasmineNode;
};

