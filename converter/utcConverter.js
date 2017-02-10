'use strict';

require('insulin').factory('ndm_utcConverter', ndm_utcConverterProducer);

function ndm_utcConverterProducer(moment) {
  /** A converter that converts dates to a UTC string in ISO8601 format. */
  class UTCConverter {
    /**
     * Convert JavaScript Date object to a UTC string fit for saving.
     * @param {Date} date - A native JavaScript Date object.
     * @return {string} An ISO8601 representation of the string, in zulu
     * (UTC) time, or null if date is null or undefined.
     */
    onSave(date) {
      if (date === null || date === undefined || date === '')
        return null;
      return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  // Singleton.
  return new UTCConverter();
}

