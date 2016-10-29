'use strict';

require('insulin').factory('ndm_Schema', ['ndm_assert'], ndm_SchemaProducer);

function ndm_SchemaProducer(assert) {
  /** A Schema is a representation of a serializable database table, consisting
   * of a series of columns.  Each column may be provided a property name
   * (mapping), which is the name that the column will be serialized as in the
   * resulting object. */
  class Schema {
    /**
     * Initialize the Schema instance.
     * @param {string} keyColumnName - The name of the unique key column,
     * generally the primary key.
     * @param {string} propertyName - An optional mapping for the key column.
     * Defaults to the same name as the key column.
     * @param {function} convert - An optional convert function that takes in
     * the value associated the key column and converts it.  For example, a
     * function that converts a bit to a boolean, or a native Date object to a
     * string.
     */
    constructor(keyColumnName, propertyName, convert) {
      // Note that these properties are treated as package private.  The DataMapper
      // accesses them directly for efficiency reasons.
      this._keyColumnName  = keyColumnName;
      this._properties     = [];
      this._schemata       = [];
      this._propertyLookup = new Map();
      
      this.addProperty(keyColumnName, propertyName, convert);
    }

    /**
     * Get the name of the key column.
     * @return {string} - The name of the key column.
     */
    getKeyColumnName() {
      return this._keyColumnName;
    }

    /**
     * Add a property to the schema.
     * @param {string} columnName - The name of the database column.
     * @param {string} propertyNamea - The name of the property in the
     * resulting object.  Defaults to the property name.
     * @param {function} convert - An optional convert function that takes in
     * the value associated the column and converts it.
     * @return {this}
     */
    addProperty(columnName, propertyName, convert) {
      propertyName = propertyName || columnName;

      // The property names must be unique.
      assert(!this._propertyLookup.has(propertyName),
        `Property "${propertyName}" already present in schema.`);

      this._propertyLookup.set(propertyName, true);
      this._properties.push({
        propertyName: propertyName,
        columnName:   columnName,
        convert:      convert
      });
      
      return this;
    }

    /**
     * Short-hand notation for adding properties.  An array can be used, or a
     * series of strings (variadic).
     * @param {string[]} propertyNames - An array of property names.
     * @return {this}
     */
    addProperties(propertyNames) {
      // If passed variadically convert the arguments to an array.
      if (!(propertyNames instanceof Array))
        propertyNames = Array.prototype.slice.call(arguments);

      for (let i = 0; i < propertyNames.length; ++i)
        this.addProperty(propertyNames[i]);
      
      return this;
    }

    /**
     * Get the array of properties.  Each property has the column name and the
     * property name.
     * @return {Object[]} - An array of properties, each with a propertyName,
     * columnName, and convert function.
     */
    getProperties() {
      return this._properties;
    }

    /**
     * Add a sub schema, which is a related table and will be nested under this
     * schema using propertyName.
     * @param {string} propertyName - The name of the sub schema property.
     * @param {Schema} schema - A Schema instance.
     * @param {string} relationshipType - The type of relationship, either
     * single (object) or many (array).  Defaults to
     * Schema.RELATIONSHIP_TYPE.MANY.
     * @return {this}
     */
    addSchema(propertyName, schema, relationshipType) {
      // The property names must be unique.
      assert(!this._propertyLookup.has(propertyName),
        `Property "${propertyName}" already present in schema.`);

      this._propertyLookup.set(propertyName, true);

      this._schemata.push({
        propertyName:     propertyName,
        schema:           schema,
        relationshipType: relationshipType || Schema.RELATIONSHIP_TYPE.MANY
      });
      
      return this;
    }

    /**
     * Get the array of schemata, each of which has a property name and a Schema
     * instance.
     * @return {Object[]} - An array of objects, each with a property name and
     * a Schema instance.
     */
    getSchemata() {
      return this._schemata;
    }
  }

  Schema.RELATIONSHIP_TYPE = {MANY: 'many', SINGLE: 'single'};

  return Schema;
}

