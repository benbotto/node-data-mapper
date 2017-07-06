'use strict';

require('insulin').factory('ndm_ConditionError', ndm_ConditionErrorProducer);

function ndm_ConditionErrorProducer(DetailedError) {
  /** 
   * Custom error instance for Condition (lex/parse/compile) errors.
   */
  class ConditionError extends DetailedError {
    /**
     * Create the Error instance with a user-supplied message.
     * @param {string} message - The Description of the error.
     */
    constructor(message) {
      super(message, 'CONDITION_ERROR');
      this.name = 'ConditionError';
    }
  }

  return ConditionError;
}

