module.exports = function(grunt, scripts)
{
  'use strict';

  var watch =
  {
    test:
    {
      files: scripts.app.concat(scripts.spec),
      tasks: ['jasmine_nodejs']
    }
  };

  grunt.loadNpmTasks('grunt-contrib-watch');

  return watch;
};
  
