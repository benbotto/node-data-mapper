'use strict';

module.exports = function(verbose)
{
  var files    = {};
  var glob     = require('glob');
  var globOpts = {cwd: __dirname + '/../'};

  // Application files.
  files.app = glob.sync('**/*.js', globOpts).filter(function(script)
  {
    return !script.match(/node_modules/) &&
           !script.match(/coverage/i) &&
           !script.match(/grunt/i) &&
           !script.match(/Spec.js$/);
  });

  // Grunt files.
  files.grunt = ['Gruntfile.js'].concat(glob.sync('grunt/*.js', globOpts));

  // Specs.
  files.spec = glob.sync('**/*Spec.js', globOpts).filter(function(script)
  {
    return !script.match(/node_modules/) &&
           !script.match(/coverage/i) &&
           !script.match(/grunt/i);
  });

  if (verbose)
  {
    console.log('Script garner gathered the following files.');
    console.dir(files);
  }

  return files;
};

