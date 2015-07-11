module.exports = function(grunt, scripts)
{
  'use strict';

  var jshint =
  {
    /* Global options. */
    options:
    {
      strict:    true,
      eqeqeq:    true,
      indent:    2,
      quotmark:  'single',
      undef:     true,
      unused:    true,
      node:      true
    },

    /* Get the lint out of all app files. */
    app:
    {
      files:
      {
        src: scripts.app
      }
    },

    /* Unit tests. */
    unitTests:
    {
      options:
      {
        globals:
        {
          describe:   true,
          it:         true,
          expect:     true,
          beforeEach: true,
          afterEach:  true,
          spyOn:      true,
          inject:     true,
          jasmine:    true,
          console:    true
        }
      },
      files:
      {
        src: scripts.spec
      }
    },

    /* Grunt files. */
    grunt:
    {
      files:
      {
        src: scripts.grunt
      }
    },
  };

  grunt.loadNpmTasks('grunt-contrib-jshint');

  return jshint;
};

