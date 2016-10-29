'use strict';

const insulin = require('insulin');

// The bootstrap file lets everything register itself with the DiC, insulin,
// and returns a list if files.  This script goes through the collection of
// files returned by the bootstrap process and sets up an object that has an
// instance of each.  New files are automagically picked up and exported, and
// consumers can choose whether or not to use insulin.

const files = require('./bootstrap');
const exp   = {};

files.forEach(f => {
  // Remove the everything up to the final "/" and the ".js" extension.
  const name = f.replace(/^.*\/([^\/]+)\.js$/, '$1');
  exp[name]  = insulin.get(name);
});

module.exports = exp;

