'use strict';

module.exports =
{
  /**
   * Convert the buffer to a boolean.
   * @param bit Either an instance of a Buffer containing a 1 or a 0, or a number.
   */
  onRetrieve: function(bit)
  {
    if (bit === null || bit === undefined || bit === '')
      return null;

    if (Buffer.isBuffer(bit))
      return bit[0] === 1;

    return bit === '1' || bit === 1;
  },

  /**
   * Convert a boolean to a bit.
   * @param bool A boolean value.
   */
  onSave: function(bool)
  {
    if (bool === null || bool === undefined || bool === '')
      return null;
    return bool ? 1 : 0;
  }
};

