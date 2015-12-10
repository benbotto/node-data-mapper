'use strict';

var assert = require(__dirname + '/../util/assert');

/**
 * A Schema is a representation of a serializable database table, consisting of
 * a series of columns.  Each column may be provided a property name, which is
 * the name that the column will be serialized as in the resulting object.
 * @param keyColumnName The name of the unique key column, generally the
 *        primary key.
 * @param propertyName An optional alias for the key column.  Defaults to the
 *        same name as the key column.
 */
function Schema(keyColumnName, propertyName)
{
  // Note that these properties are treated as package private.  The DataMapper
  // accesses them directly for efficiency reasons.
  this._keyColumnName  = keyColumnName;
  this._properties     = [];
  this._schemata       = [];
  this._propertyLookup = {};
  
  this.addProperty(keyColumnName, propertyName);
}

Schema.RELATIONSHIP_TYPE = {MANY: 'many', SINGLE: 'single'};

/**
 * Get the name of the key column.
 */
Schema.prototype.getKeyColumnName = function()
{
  return this._keyColumnName;
};

/**
 * Add a property to the schema.
 * @param columnName The name of the database column.
 * @param propertyName The name of the property in the resulting object.
 *        Defaults to the property name.
 */
Schema.prototype.addProperty = function(columnName, propertyName)
{
  propertyName = propertyName || columnName;

  // The property names must be unique.
  assert(this._propertyLookup[propertyName] === undefined,
    'Property "' + propertyName + '" already present in schema.');

  this._propertyLookup[propertyName] = true;
  this._properties.push
  ({
    propertyName: propertyName,
    columnName:   columnName
  });
  
  return this;
};

/**
 * Short-hand notation for adding properties.  An array can be used, or a
 * series of strings (variadic).
 * @param propertyNames An array of property names.
 */
Schema.prototype.addProperties = function(propertyNames)
{
  // If passed variadically convert the arguments to an array.
  if (!(propertyNames instanceof Array))
    propertyNames = Array.prototype.slice.call(arguments);

  for (var i = 0; i < propertyNames.length; ++i)
    this.addProperty(propertyNames[i]);
  
  return this;
};

/**
 * Get the array of properties.  Each property has the column name and the
 * property name.
 */
Schema.prototype.getProperties = function()
{
  return this._properties;
};

/**
 * Add a sub schema, which is a related table and will be nested under this
 * schema using propertyName.
 * @param propertyName The name of the sub schema property.
 * @param schema A Schema instance.
 * @param relationshipType The type of relationship, either single (object) or
 *        many (array).  Defaults to Schema.RELATIONSHIP_TYPE.MANY.
 */
Schema.prototype.addSchema = function(propertyName, schema, relationshipType)
{
  // The property names must be unique.
  assert(this._propertyLookup[propertyName] === undefined,
    'Property "' + propertyName + '" already present in schema.');

  this._propertyLookup[propertyName] = true;

  this._schemata.push
  ({
    propertyName:     propertyName,
    schema:           schema,
    relationshipType: relationshipType || Schema.RELATIONSHIP_TYPE.MANY
  });
  
  return this;
};

/**
 * Get the array of schemata, each of which has a property name and a Schema
 * instance.
 */
Schema.prototype.getSchemata = function()
{
  return this._schemata;
};

module.exports = Schema;

