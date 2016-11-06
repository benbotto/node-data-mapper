'use strict';

require('insulin').factory('ndm_Column', ['ndm_assert'], ColumnProducer);

function ColumnProducer(assert) {
  /** Represents a database column. */
  class Column {
    /**
     * Initialize the column.
     * @param {object} column - An object representing the database column.  Any
     * custom properties on the object shall be preserved.
     * @param {string} column.name - The name of the column.
     * @param {string} [column.mapTo=column.name] - When the column is
     * serialized, the resulting object will use this property name.
     * @param {boolean} [column.isPrimary=false] Whether or not this column is a
     * primary key.
     * @param {object} [column.converter={}] An optional converter object
     * containing onRetrieve and/or onSave methods.  These methods will be called
     * when a column is serialized after a select, and before the column is saved
     * to the database, respectively.
     */
    constructor(column) {
      assert(column.name, 'Column name is required.');

      // Copy all the properties from column.  Anything that the user adds to the
      // column will be preserved.  Commonly, the user needs more information
      // about a column than is strictly required by ndm (e.g. dataType,
      // isNullable, maxLength, defaultValue, etc.).
      Object.assign(this, column);

      this.mapTo     = this.mapTo || this.name;
      this.isPrimary = !!this.isPrimary;
      this.converter = this.converter || {};
    }

    /**
     * Create a fully-qualified column name in the form
     * &lt;table-alias&gt;.&lt;column-name&gt;.
     * @param {string} tableAlias - The alias for the table.
     * @param {string} colName - The column name.
     * @return {string} The fully-qualified column name, unescaped.
     */
    static createFQColName(tableAlias, colName) {
      return `${tableAlias}.${colName}`;
    }
  }

  return Column;
}

