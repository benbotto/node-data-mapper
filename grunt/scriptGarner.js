'use strict';

module.exports = function(verbose) {
  const glob    = require('glob');
  const files   = {};
  const ignores = [
    'node_modules/**',
    'grunt/**',
    'doc/**',
    'coverage/**',
    'example/**',
    'scratch/**',
    'spec/**',
    'bootstrap.js',
    'Gruntfile.js',
    'index.js'
  ];

  let opts = {};

  // Application files.
  opts.ignore = ignores.concat(['**/*Spec.js']);
  files.app   = glob.sync('**/*.js', opts);

  // Specs.
  opts.ignore = ignores;
  files.spec  = glob.sync('**/*Spec.js', opts);

  // Test helpers.
  opts.ignore  = [];
  files.helper = glob.sync('spec/*Helper.js');

  // Grunt files.
  opts.ignore = [];
  files.grunt = ['Gruntfile.js'].concat(glob.sync('grunt/*.js', opts));

  if (verbose) {
    console.log('Script garner gathered the following files.');
    console.dir(files);
  }

  return files;
};

