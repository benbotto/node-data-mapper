'use strict';

var Schema = require('./Schema');

/**
 * The DataMapper serializes a schema into an object.
 */
function DataMapper()
{
}

/**
 * Serialize the query into the object defined by the Schema instance.
 * @param query The query, which is an array of objects containing keys as
 *        properties.
 * @param schema The Schema instance describing how to serialize the query.
 */
DataMapper.prototype.serialize = function(query, schema)
{
  var collection = [];
  var lookup     = {};

  // Helper function to recursively serialize a row of query data.
  function serializeRow(queryRow, schema, collection, properties, lookup,
    schemata, relationshipType)
  {
    var keyCol = schema._keyColumnName;
    var keyVal = queryRow[keyCol];
    var doc, i, subProps, subSchemata;

    // The keyCol is null, meaning this was an outer join and there is no
    // related data.
    if (!keyVal)
      return;
      
    // First time encountering this key.  Create a document for it.
    if (lookup[keyVal] === undefined)
    {
      // If serializing to an array (a many relationship) then make a new
      // document for this row, otherwise the data will be added directly to
      // the collection.
      if (relationshipType === Schema.RELATIONSHIP_TYPE.MANY)
        doc = {};
      else
        doc = collection;

      // Add each property->column value to the document.
      for (i = 0; i < properties.length; ++i)
      {
        if (properties[i].convert)
          doc[properties[i].propertyName] = properties[i].convert(queryRow[properties[i].columnName]);
        else
          doc[properties[i].propertyName] = queryRow[properties[i].columnName];
      }

      // Add the document to the collection (if serializing to an array).
      if (relationshipType === Schema.RELATIONSHIP_TYPE.MANY)
        collection.push(doc);

      // This lookup is used to ensure uniqueness.
      lookup[keyVal] =
      {
        document: doc,
        lookup:   {}
      };
    }
    else
      doc = lookup[keyVal].document;

    // Now serialize each sub schema.
    for (i = 0; i < schemata.length; ++i)
    {
      subProps    = schemata[i].schema._properties;
      subSchemata = schemata[i].schema._schemata;
      
      // This sub schemata hasn't been encountered yet.
      if (doc[schemata[i].propertyName] === undefined)
      {
        if (schemata[i].relationshipType === Schema.RELATIONSHIP_TYPE.SINGLE)
          doc[schemata[i].propertyName] = {};
        else
          doc[schemata[i].propertyName] = [];
      }
      
      // Recurse and serialize the sub schemata.  Note that the lookup for each
      // schema needs to be unique because there could be two schemata at the
      // same level that have key columns with the same value (e.g. a person with
      // product and phone numbers, and phoneNumberID = 1 and productID = 1).
      if (lookup[keyVal].lookup[schemata[i].propertyName] === undefined)
        lookup[keyVal].lookup[schemata[i].propertyName] = {};

      serializeRow(queryRow, schemata[i].schema, doc[schemata[i].propertyName],
        subProps, lookup[keyVal].lookup[schemata[i].propertyName], subSchemata,
        schemata[i].relationshipType);
    }
  }
  
  // Serialize each row recursively.
  for (var i = 0; i < query.length; ++i)
  {
    serializeRow(query[i], schema, collection, schema._properties, lookup,
      schema._schemata, Schema.RELATIONSHIP_TYPE.MANY);
  }

  return collection;
};

module.exports = DataMapper;

