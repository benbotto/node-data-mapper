'use strict';

/**
 * This script sets up the dependency injection container, insulin.
 */
const insulin = require('insulin');
const scripts = (require('./grunt/scriptGarner.js'))().app;

// Static dependencies.
insulin
  .factory('mysql',    () => require('mysql'))
  .factory('moment',   () => require('moment'))
  .factory('deferred', () => require('deferred'));

// Application (dynamic) dependencies.
scripts.forEach(script => require(`${__dirname}/${script}`));

// Export the list of files.
module.exports = scripts;

