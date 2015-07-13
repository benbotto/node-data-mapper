/**
 * Function that throws an Error(message) if condition is falsy.
 * @param condition The condition, which is checked if falsy (!condition).
 * @param message The message wich is thrown in an Error if condition is falsy.
 */
module.exports = function(condition, message)
{
  'use strict';

  if (!condition)
    throw new Error(message);
};
