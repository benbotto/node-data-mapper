'use strict';

var files    = {};
var glob     = require('glob');
var globOpts = {cwd: __dirname + '/../'};

// Application files.
files.app = glob.sync('**/*.js', globOpts).filter(function(script)
{
  return !script.match(/node_modules/) &&
         !script.match(/grunt/i) &&
         !script.match(/spec/);
});

// Grunt files.
files.grunt = glob.sync('**/*.js', globOpts).filter(function(script)
{
  return !script.match(/node_modules/) &&
         script.match(/grunt/i);
});

// Specs.
files.spec = glob.sync('spec/**/*.js', globOpts);

console.log('Script garner gathered the following files.');
console.dir(files);

module.exports = files;

