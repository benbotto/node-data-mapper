describe('MetaBuilder test suite.', function()
{
  'use strict';

  var MetaBuilder  = require('./MetaBuilder');
  var Database     = require('../database/Database');
  var metaBuilder  = new MetaBuilder();
  var db           = new Database(require('../spec/testDB'));

  describe('MetaBuilder buildMeta test suite.', function()
  {
    // Checks a basic model.
    it('checks a basic model.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      expect(meta).toEqual
      ([
        {
          model: {first: 'Sandy', last: 'Perkins'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName',  value: 'Perkins'}
          ]
        }
      ]);
    });

    // Checks a basic model with a null value.
    it('checks a basic model with a null value.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users: {first: 'Sandy', last: null}
      });

      expect(meta).toEqual
      ([
        {
          model: {first: 'Sandy', last: null},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName',  value: null}
          ]
        }
      ]);
    });

    // Checks a model with a non-table-alias property.
    it('checks a model with a non-table-alias property.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        foo: {bar: 'baz'}
      });

      expect(meta).toEqual([]);
    });

    // Checks an array model with one element.
    it('checks an array model with one element.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users: [{first: 'Sandy', last: 'Perkins'}]
      });

      expect(meta).toEqual
      ([
        {
          model: {first: 'Sandy', last: 'Perkins'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName',  value: 'Perkins'}
          ]
        }
      ]);
    });

    // Checks an array model with multiple elements.
    it('checks an array model with multiple elements.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users:
        [
          {first: 'Sandy', last: 'Perkins'},
          {first: 'Jose',  last: 'Quervo'},
          {first: 'Rose',  last: 'Marker'}
        ]
      });

      expect(meta).toEqual
      ([
        {
          model: {first: 'Sandy', last: 'Perkins'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName', value: 'Perkins'}
          ]
        },
        {
          model: {first: 'Jose', last: 'Quervo'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Jose'},
            {columnName: 'lastName', value: 'Quervo'}
          ]
        },
        {
          model: {first: 'Rose', last: 'Marker'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Rose'},
            {columnName: 'lastName', value: 'Marker'}
          ]
        }
      ]);
    });

    // Checks a model with two table aliases.
    it('checks a model with two table aliases.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users: {first: 'Sandy', last: 'Perkins'},
        phoneNumbers: {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
      });

      expect(meta).toEqual
      ([
        {
          model: {first: 'Sandy', last: 'Perkins'},
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName', value: 'Perkins'}
          ]
        },
        {
          model: {userID: 12, phoneNumber: '999-888-7777', type: 'home'},
          tableName: 'phone_numbers',
          fields:
          [
            {columnName: 'userID', value: 12},
            {columnName: 'phoneNumber', value: '999-888-7777'},
            {columnName: 'type', value: 'home'}]
        }
      ]);
    });

    // Checks a model with a nested model.
    it('checks a model with a nested model.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users:
        {
          first: 'Sandy',
          last: 'Perkins',
          phoneNumbers:
          [
            {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
          ]
        }
      });

      expect(meta).toEqual
      ([
        {
          model:
          {
            first: 'Sandy',
            last: 'Perkins',
            phoneNumbers:
            [
              {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
            ]
          },
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName', value: 'Perkins'}
          ]
        }
      ]);
    });

    // Checks that an invalid recurseType throws.
    it('checks that an invalid recurseType throws.', function()
    {
      expect(function()
      {
        metaBuilder.buildMeta(db, {}, 'invalid');
      }).toThrowError('Invalid recurseType.');
    });
  });

  // Note: The recursive traversal is mainly tested in modelTraverseSpec.js.
  describe('MetaBuilder depth-first recurse mode.', function()
  {
    // Checks a model with a nested model.
    it('checks a model with a nested model.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users:
        {
          first: 'Sandy',
          last: 'Perkins',
          phoneNumbers:
          [
            {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
          ]
        }
      }, 'depth-first');

      expect(meta).toEqual
      ([
        {
          model: {userID: 12, phoneNumber: '999-888-7777', type: 'home'},
          tableName: 'phone_numbers',
          fields:
          [
            {columnName: 'userID', value: 12},
            {columnName: 'phoneNumber', value: '999-888-7777'},
            {columnName: 'type', value: 'home'}
          ]
        },
        {
          model:
          {
            first: 'Sandy',
            last: 'Perkins',
            phoneNumbers:
            [
              {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
            ]
          },
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName', value: 'Perkins'}
          ]
        }
      ]);
    });
  });

  describe('MetaBuilder breadth-first recurse mode.', function()
  {
    // Checks a model with a nested model.
    it('checks a model with a nested model.', function()
    {
      var meta = metaBuilder.buildMeta(db,
      {
        users:
        {
          first: 'Sandy',
          last: 'Perkins',
          phoneNumbers:
          [
            {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
          ]
        }
      }, 'breadth-first');

      expect(meta).toEqual
      ([
        {
          model:
          {
            first: 'Sandy',
            last: 'Perkins',
            phoneNumbers:
            [
              {userID: 12, phoneNumber: '999-888-7777', type: 'home'}
            ]
          },
          tableName: 'users',
          fields:
          [
            {columnName: 'firstName', value: 'Sandy'},
            {columnName: 'lastName', value: 'Perkins'}
          ]
        },
        {
          model: {userID: 12, phoneNumber: '999-888-7777', type: 'home'},
          tableName: 'phone_numbers',
          fields:
          [
            {columnName: 'userID', value: 12},
            {columnName: 'phoneNumber', value: '999-888-7777'},
            {columnName: 'type', value: 'home'}
          ]
        },
      ]);
    });
  });
});

