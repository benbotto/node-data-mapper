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
      var meta = metaBuilder.buildMeta(db, 'users', {first: 'Sandy', last: 'Perkins'});

      expect(meta).toEqual
      ({
        model: {first: 'Sandy', last: 'Perkins'},
        tableName: 'users',
        fields:
        [
          {columnName: 'firstName', value: 'Sandy'},
          {columnName: 'lastName',  value: 'Perkins'}
        ]
      });
    });

    // Checks a basic model with a null value.
    it('checks a basic model with a null value.', function()
    {
      var meta = metaBuilder.buildMeta(db, 'users', {first: 'Sandy', last: null});

      expect(meta).toEqual
      ({
        model: {first: 'Sandy', last: null},
        tableName: 'users',
        fields:
        [
          {columnName: 'firstName', value: 'Sandy'},
          {columnName: 'lastName',  value: null}
        ]
      });
    });

    // Checks a model with a non-table-alias property.
    it('checks a model with a non-table-alias property.', function()
    {
      var meta = metaBuilder.buildMeta(db, 'foo', {bar: 'baz'});
      expect(meta).toBeNull();
    });

    // Checks a model with a non-column-alias property.
    it('checks a model with a non-column-alias property.', function()
    {
      var meta = metaBuilder.buildMeta(db, 'users', {first: 'Sandy', soup: 'Onion'});

      expect(meta).toEqual
      ({
        model: {first: 'Sandy', soup: 'Onion'},
        tableName: 'users',
        fields:
        [
          {columnName: 'firstName', value: 'Sandy'}
        ]
      });
    });
  });
});

