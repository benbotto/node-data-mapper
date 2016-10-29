'use strict';

require('insulin').factory('ndm_bitConverter', ndm_bitConverterProducer);

function ndm_bitConverterProducer() {
  /** A converter that converts buffers and numbers to booleans and back. */
  class BitConverter {
    /**
     * Convert the "bit" to a boolean.
     * @param {number|Buffer} bit - Either an instance of a Buffer containing a 1
     * or a 0, or a number.
     * @return {boolean} - The bit's representation as a boolean.
     */
    onRetrieve(bit) {
      if (bit === null || bit === undefined || bit === '')
        return null;

      if (Buffer.isBuffer(bit))
        return bit[0] === 1;

      return bit === '1' || bit === 1;
    }

    /**
     * Convert a boolean to a bit.
     * @param {boolean} bool - A boolean value.
     * @return {number} - The boolean's representation as a number (1 or 0),
     * or null if bool is null or undefined.
     */
    onSave(bool) {
      if (bool === null || bool === undefined || bool === '')
        return null;
      return bool ? 1 : 0;
    }
  }

  // Singleton.
  return new BitConverter();
}

