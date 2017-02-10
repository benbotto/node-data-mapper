'use strict';

require('insulin').factory('ndm_DataMapper', ['ndm_Schema'], ndm_DataMapperProducer);

function ndm_DataMapperProducer(Schema) {
  /** Class that serializes a Schema into a normalized object. */
  class DataMapper {
    /**
     * Serialize the query into the an array of objects, as defined by schema.
     * @param {Object[]} query - A set of query results, which is an array of
     * objects containing keys as properties and values from a database query.
     * @param {Schema} schema - The Schema instance describing how to serialize the query.
     * @return {Object[]} An array of objects that is normalized.
     */
    serialize(query, schema) {
      const collection = [];
      const lookup     = {};

      // Helper function to recursively serialize a row of query data.
      function serializeRow(queryRow, schema, collection, properties, lookup,
        schemata, relationshipType) {
        const keyCol = schema._keyColumnName;
        const keyVal = queryRow[keyCol];
        let doc, subProps, subSchemata;

        // The keyCol is null, meaning this was an outer join and there is no
        // related data.
        if (!keyVal)
          return;
          
        // First time encountering this key.  Create a document for it.
        if (lookup[keyVal] === undefined) {
          // If serializing to an array (a many relationship) then make a new
          // document for this row, otherwise the data will be added directly to
          // the collection.
          if (relationshipType === Schema.RELATIONSHIP_TYPE.MANY)
            doc = {};
          else
            doc = collection;

          // Add each property->column value to the document.
          for (let i = 0; i < properties.length; ++i) {
            if (properties[i].convert)
              doc[properties[i].propertyName] = properties[i].convert(queryRow[properties[i].columnName]);
            else
              doc[properties[i].propertyName] = queryRow[properties[i].columnName];
          }

          // Add the document to the collection (if serializing to an array).
          if (relationshipType === Schema.RELATIONSHIP_TYPE.MANY)
            collection.push(doc);

          // This lookup is used to ensure uniqueness.
          lookup[keyVal] = {
            document: doc,
            lookup:   {}
          };
        }
        else
          doc = lookup[keyVal].document;

        // Now serialize each sub schema.
        for (let i = 0; i < schemata.length; ++i) {
          subProps    = schemata[i].schema._properties;
          subSchemata = schemata[i].schema._schemata;
          
          // This sub schemata hasn't been encountered yet.
          if (doc[schemata[i].propertyName] === undefined) {
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
      for (let i = 0; i < query.length; ++i) {
        serializeRow(query[i], schema, collection, schema._properties, lookup,
          schema._schemata, Schema.RELATIONSHIP_TYPE.MANY);
      }

      return collection;
    }
  }

  return DataMapper;
}

