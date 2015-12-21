/**
 * Convert the buffer to a boolean.
 * @param bit Either an instance of a Buffer containing a 1 or a 0, or a number.
 */
module.exports = function(bit)
{
  'use strict';

  if (bit === null || bit === undefined || bit === '')
    return null;

  if (Buffer.isBuffer(bit))
    return bit[0] === 1;

  return bit === '1' || bit === 1;
};

