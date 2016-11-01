'use strict';

require('insulin').factory('ndm_Escaper', ndm_EscaperProducer);

function ndm_EscaperProducer() {
  /** Helper class for escaping parts of a query. */
  class Escaper {
    /**
     * Escape a property, such as a table, column name, or alias.
     * @param {string} prop - The property to escape.
     * @return {string} The escaped property.
     */
    escapeProperty(/*prop*/) {
      throw new Error('Function escapeProperty() is not implemented.');
    }

    /**
     * Escape a literal, such as a string or a number.
     * @param {any} literal - The literal to escape, which is escaped based on
     * its type.
     * @return {string} The escaped literal, as a string.
     */
    escapeLiteral(/*literal*/) {
      throw new Error('Function escapeLiteral() is not implemented.');
    }

    /**
     * Escape a fully-qualified column name, such as 'u.firstName' or
     * 'phone_numbers.phoneNumber'.
     * @param {string} fqc - The fully-qualified column.
     * @return {string} The escaped column name.
     */
    escapeFullyQualifiedColumn(fqc) {
      const firstDot = fqc.indexOf('.');
      let tbl, col;
      
      // There is no dot, it's just a column name.
      if (firstDot === -1)
        return this.escapeProperty(fqc);

      // Get the table and column parts and escape each individually.
      tbl = this.escapeProperty(fqc.substring(0, firstDot));
      col = this.escapeProperty(fqc.substring(firstDot + 1));

      return `${tbl}.${col}`;
    }
  }

  return Escaper;
}

