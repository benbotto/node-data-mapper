'use strict';

require('insulin').factory('ndm_ParameterList', ndm_ParameterListProducer);

function ndm_ParameterListProducer() {
  /** A class that holds query parameters. */
  class ParameterList {
    /**
     * Initialize the list of parameters.
     */
    constructor() {
      /**
       * An object containing key-value pairs, each of which is a query
       * parameter.
       * @type {Object}
       * @name ParameterList#params
       * @public
       */
      this.params = {};
    }

    /**
     * Add a parameter to the list.
     * @param {string} key - The name of the parameter.
     * @param {any} value - The parameter value.
     * @param {boolean} [overwrite=false] - By default, an exception will be
     * raised if a parameter matching key already exists.  If this flag is set
     * to true, however, then parameters will be blindly overwritten.
     * @return {this}
     */
    addParameter(key, value, overwrite=false) {
      if (this.params[key] === undefined || this.params[key] === value || overwrite)
        this.params[key] = value;
      else
        throw new Error(`Parameter "${key}" already exists with value "${this.params[key]}".`);

      return this;
    }
  }

  return ParameterList;
}

