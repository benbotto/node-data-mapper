describe('Schema()', function() {
  'use strict';

  const insulin = require('insulin');
  const Schema  = insulin.get('ndm_Schema');

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('stores the column name and alias.', function() {
      const schema = new Schema('pid', 'personID');
      const props  = schema.getProperties();

      expect(props.length).toBe(1);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(schema.getKeyColumnName()).toBe('pid');
    });
  });

  /**
   * Add properties.
   */
  describe('.addProperty()', function() {
    it('defaults the property name to the column name.', function() {
      const schema = new Schema('pid', 'personID')
        .addProperty('firstName')
        .addProperty('lastName');
      const props  = schema.getProperties();

      expect(props.length).toBe(3);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(props[1].propertyName).toBe('firstName');
      expect(props[1].columnName).toBe('firstName');
      expect(props[2].propertyName).toBe('lastName');
      expect(props[2].columnName).toBe('lastName');
    });

    it('allows for custom property names.', function() {
      const schema = new Schema('pid', 'personID')
        .addProperty('firstName', 'name');
      const props  = schema.getProperties();

      expect(props.length).toBe(2);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(props[1].propertyName).toBe('name');
      expect(props[1].columnName).toBe('firstName');
    });

    it('stores the column converter.', function() {
      const convert = {};
      const schema  = new Schema('pid', 'personID', convert)
        .addProperty('firstName', null, convert)
        .addProperty('lastName');
      const props   = schema.getProperties();

      expect(props.length).toBe(3);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(props[0].convert).toBe(convert);
      expect(props[1].propertyName).toBe('firstName');
      expect(props[1].columnName).toBe('firstName');
      expect(props[1].convert).toBe(convert);
      expect(props[2].propertyName).toBe('lastName');
      expect(props[2].columnName).toBe('lastName');
      expect(props[2].convert).toBe(undefined);
    });

    it('throw if the property name has been used.', function() {
      expect(function() {
        new Schema('pid', 'personID')
          .addProperty('pid', 'personID');
      }).toThrowError('Property "personID" already present in schema.');
    });
  });

  /**
   * Add schema.
   */
  describe('.addSchema()', function() {
    it('stores sub-schemata object with a property name.', function() {
      const schema = new Schema('pid', 'personID')
        .addSchema('phoneNumbers', new Schema('phoneNumberID'));
      const schemata = schema.getSchemata();

      expect(schemata.length).toBe(1);
      expect(schemata[0].propertyName).toBe('phoneNumbers');
      expect(schemata[0].schema.getKeyColumnName()).toBe('phoneNumberID');
    });

    it('stores the relationship type of sub-schemata.', function() {
      const schema = new Schema('personID')
        .addSchema('phoneNumbers', new Schema('phoneNumberID'))
        .addSchema('primaryPhone', new Schema('phoneNumberID'), Schema.RELATIONSHIP_TYPE.SINGLE);
      const schemata = schema.getSchemata();

      expect(schemata[0].relationshipType).toBe(Schema.RELATIONSHIP_TYPE.MANY);
      expect(schemata[1].relationshipType).toBe(Schema.RELATIONSHIP_TYPE.SINGLE);
    });

    it('throws if a property name is in use when adding a sub-schema.', function() {
      expect(function() {
        new Schema('personID').addProperty('personID');
      }).toThrowError('Property "personID" already present in schema.');

      expect(function() {
        new Schema('personID')
          .addSchema('phoneNumbers', new Schema('phoneNumberID'))
          .addSchema('phoneNumbers', new Schema('phoneNumberID'));
      }).toThrowError('Property "phoneNumbers" already present in schema.');
    });
  });

  /**
   * Add properties.
   */
  describe('.addProperties()', function() {
    it('allows an array of properties to be added.', function() {
      const schema = new Schema('pid', 'personID')
        .addProperties(['firstName', 'lastName']);
      const props  = schema.getProperties();

      expect(props.length).toBe(3);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(props[1].propertyName).toBe('firstName');
      expect(props[1].columnName).toBe('firstName');
      expect(props[2].propertyName).toBe('lastName');
      expect(props[2].columnName).toBe('lastName');
    });

    it('can be called variadically.', function() {
      const schema = new Schema('pid', 'personID')
        .addProperties('firstName', 'lastName');
      const props  = schema.getProperties();

      expect(props.length).toBe(3);
      expect(props[0].propertyName).toBe('personID');
      expect(props[0].columnName).toBe('pid');
      expect(props[1].propertyName).toBe('firstName');
      expect(props[1].columnName).toBe('firstName');
      expect(props[2].propertyName).toBe('lastName');
      expect(props[2].columnName).toBe('lastName');
    });
  });
});

