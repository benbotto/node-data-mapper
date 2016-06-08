'use strict';

var moment = require('moment');

module.exports =
{
  /**
   * Convert JavaScript Date object to a UTC string fit for saving.
   * @param date A native JavaScript Date object.
   */
  onSave: function(date)
  {
    if (date === null || date === undefined || date === '')
      return null;
    return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
  }
};

