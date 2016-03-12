describe('Schema test suite.', function()
{
  'use strict';

  var Schema = require('./Schema');

  // Checks the constructor.
  it('checks the constructor.', function()
  {
    var schema = new Schema('pid', 'personID');
    var props  = schema.getProperties();

    expect(props.length).toBe(1);
    expect(props[0].propertyName).toBe('personID');
    expect(props[0].columnName).toBe('pid');
    expect(schema.getKeyColumnName()).toBe('pid');
  });

  // Adds a few properties.
  it('adds a few properties.', function()
  {
    var schema = new Schema('pid', 'personID')
      .addProperty('firstName')
      .addProperty('lastName');
    var props  = schema.getProperties();

    expect(props.length).toBe(3);
    expect(props[0].propertyName).toBe('personID');
    expect(props[0].columnName).toBe('pid');
    expect(props[1].propertyName).toBe('firstName');
    expect(props[1].columnName).toBe('firstName');
    expect(props[2].propertyName).toBe('lastName');
    expect(props[2].columnName).toBe('lastName');
  });

  // Adds a property with an alias.
  it('adds a property with an alias.', function()
  {
    var schema = new Schema('pid', 'personID')
      .addProperty('firstName', 'name');
    var props  = schema.getProperties();

    expect(props.length).toBe(2);
    expect(props[0].propertyName).toBe('personID');
    expect(props[0].columnName).toBe('pid');
    expect(props[1].propertyName).toBe('name');
    expect(props[1].columnName).toBe('firstName');
  });

  // Adds a property with a converter.
  it('adds a property with a converter.', function()
  {
    var convert = {};
    var schema  = new Schema('pid', 'personID', convert)
      .addProperty('firstName', null, convert)
      .addProperty('lastName');
    var props   = schema.getProperties();

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

  // Adds some sub schemata.
  it('adds some sub schemata.', function()
  {
    var schema = new Schema('pid', 'personID')
      .addSchema('phoneNumbers', new Schema('phoneNumberID'));
    var schemata = schema.getSchemata();

    expect(schemata.length).toBe(1);
    expect(schemata[0].propertyName).toBe('phoneNumbers');
    expect(schemata[0].schema.getKeyColumnName()).toBe('phoneNumberID');
  });

  // Adds an array of properties.
  it('adds an array of properties.', function()
  {
    var schema = new Schema('pid', 'personID')
      .addProperties(['firstName', 'lastName']);
    var props  = schema.getProperties();

    expect(props.length).toBe(3);
    expect(props[0].propertyName).toBe('personID');
    expect(props[0].columnName).toBe('pid');
    expect(props[1].propertyName).toBe('firstName');
    expect(props[1].columnName).toBe('firstName');
    expect(props[2].propertyName).toBe('lastName');
    expect(props[2].columnName).toBe('lastName');
  });

  // Adds properties variadically.
  it('adds properties variadically.', function()
  {
    var schema = new Schema('pid', 'personID')
      .addProperties('firstName', 'lastName');
    var props  = schema.getProperties();

    expect(props.length).toBe(3);
    expect(props[0].propertyName).toBe('personID');
    expect(props[0].columnName).toBe('pid');
    expect(props[1].propertyName).toBe('firstName');
    expect(props[1].columnName).toBe('firstName');
    expect(props[2].propertyName).toBe('lastName');
    expect(props[2].columnName).toBe('lastName');
  });

  // Adds a sub schema with a relationship type.
  it('adds a sub schema with a relationship type.', function()
  {
    var schema = new Schema('personID')
      .addSchema('phoneNumbers', new Schema('phoneNumberID'))
      .addSchema('primaryPhone', new Schema('phoneNumberID'), Schema.RELATIONSHIP_TYPE.SINGLE);
    var schemata = schema.getSchemata();

    expect(schemata[0].relationshipType).toBe(Schema.RELATIONSHIP_TYPE.MANY);
    expect(schemata[1].relationshipType).toBe(Schema.RELATIONSHIP_TYPE.SINGLE);
  });

  // Checks that the same property name cannot be used twice.
  it('checks that the same property name cannot be used twice.', function()
  {
    expect(function()
    {
      new Schema('personID').addProperty('personID');
    }).toThrowError('Property "personID" already present in schema.');

    expect(function()
    {
      new Schema('personID')
        .addSchema('phoneNumbers', new Schema('phoneNumberID'))
        .addSchema('phoneNumbers', new Schema('phoneNumberID'));
    }).toThrowError('Property "phoneNumbers" already present in schema.');
  });
});

