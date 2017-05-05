'use strict';

const insulin = require('insulin');
const path    = require('path');

// The bootstrap file lets everything register itself with the DiC, insulin,
// and returns a list if files.  This script goes through the collection of
// files returned by the bootstrap process and sets up an object that has an
// instance of each.  New files are automagically picked up and exported, and
// consumers can choose whether or not to use insulin.

const files = require('./bootstrap');
const exp   = {};

files.forEach(f => {
  // Use the file name, without the extension.
  const name = path.basename(f, '.js');
  exp[name]  = insulin.get(`ndm_${name}`);
});

module.exports = exp;

