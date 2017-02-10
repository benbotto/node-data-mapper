'use strict';

module.exports = function(verbose) {
  const glob    = require('glob');
  const fs      = require('fs');
  const files   = {};
  const ignores = [
    '../node_modules/**',
    '../grunt/**',
    '../doc/**',
    '../coverage/**',
    '../example/**',
    '../scratch/**',
    '../spec/**',
    '../bootstrap.js',
    '../Gruntfile.js',
    '../index.js'
  ];
  
  // Since NDM is generally included as a module, the scripts need to be
  // searched for relative to this file, and the resulting paths must be
  // absolute.
  const opts = {
    cwd:      __dirname,
    realpath: true
  };

  // Application files.
  opts.ignore = ignores.concat(['../**/*Spec.js']);
  files.app   = glob.sync('../**/*.js', opts);

  // Specs.
  opts.ignore = ignores;
  files.spec  = glob.sync('../**/*Spec.js', opts);

  // Test helpers.
  opts.ignore  = [];
  files.helper = glob.sync('../spec/*Helper.js', opts);

  // Grunt files.
  opts.ignore = [];
  files.grunt = [fs.realpathSync(`${__dirname}/../Gruntfile.js`)]
    .concat(glob.sync('../grunt/*.js', opts));

  if (verbose) {
    console.log('Script garner gathered the following files.');
    console.dir(files);
  }

  return files;
};

