'use strict';

/**
 * This script sets up the dependency injection container, insulin.
 */
const insulin = require('insulin');
const scripts = (require('./grunt/scriptGarner.js'))().app;

// Static dependencies.
insulin
  .factory('moment',   () => require('moment'))
  .factory('deferred', () => require('deferred'));

// Custom error classes (DetailedError is used).  This package registers itself
// with insulin.
require('bsy-error');

// Application (dynamic) dependencies.
scripts.forEach(script => require(script));

// Export the list of files.
module.exports = scripts;

