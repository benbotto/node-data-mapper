'use strict';

require('insulin').factory('ndm_MySQLEscaper',
  ['mysql', 'ndm_Escaper'], ndm_MySQLEscaperProducer);

function ndm_MySQLEscaperProducer(mysql, Escaper) {
  /**
   * Helper class for escaping parts of a query under MySQL.
   * @extends Escaper
   */
  class MySQLEscaper extends Escaper {
    /**
     * Initialize the escaper.
     */
    constructor() {
      super();
    }

    /**
     * Escape a property, such as a table, column name, or alias.
     * @param {string} prop - The property to escape.
     * @return {string} The escaped property.
     */
    escapeProperty(prop) {
      return mysql.escapeId(prop, true);
    }

    /**
     * Escape a literal, such as a string or a number.
     * @param literal {any} - The literal to escape, which is escaped based on its type.
     * @return {string} The escaped literal, as a string.
     */
    escapeLiteral(literal) {
      return mysql.escape(literal);
    }
  }

  return MySQLEscaper;
}

