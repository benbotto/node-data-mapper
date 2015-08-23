module.exports = function(grunt, scripts)
{
  'use strict';

  var watch =
  {
    test:
    {
      options:
      {
        atBegin: true
      },
      files: scripts.app.concat(scripts.spec),
      tasks: ['jshint', 'jasmine_nodejs']
    }
  };

  grunt.loadNpmTasks('grunt-contrib-watch');

  return watch;
};
  
