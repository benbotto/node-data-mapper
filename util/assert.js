'use strict';

require('insulin').factory('ndm_assert', ndm_assertProducer);

function ndm_assertProducer() {
  /**
   * Function that throws an Error(message) if condition is falsy.
   * @param {boolean} condition - The condition, which is checked if falsy
   * (!condition).
   * @param {string} message - The message wich is thrown in an Error if
   * condition is falsy.
   * @return {void}
   */
  return function(condition, message) {
    if (!condition)
      throw new Error(message);
  };
}

