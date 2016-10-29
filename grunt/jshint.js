'use strict';

module.exports = function(grunt, scripts) {
  const jshint = {
    /* Global options. */
    options: {
      strict:    true,
      eqeqeq:    true,
      indent:    2,
      undef:     true,
      unused:    true,
      node:      true,
      esnext:    true
    },

    /* Get the lint out of all app files. */
    app: {
      files: {
        src: scripts.app
      }
    },

    /* Unit tests. */
    unitTests: {
      options: {
        globals: {
          describe:   true,
          xdescribe:  true,
          it:         true,
          xit:        true,
          expect:     true,
          beforeEach: true,
          afterEach:  true,
          beforeAll:  true,
          spyOn:      true,
          inject:     true,
          jasmine:    true,
          console:    true
        }
      },
      files: {
        src: scripts.spec
      }
    },

    /* Grunt files. */
    grunt: {
      files: {
        src: scripts.grunt
      }
    },
  };

  grunt.loadNpmTasks('grunt-contrib-jshint');

  return jshint;
};

