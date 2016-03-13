describe('SELECT test suite.', function()
{
  'use strict';

  var From         = require('./From');
  var Select       = require('./Select');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['select']);
  });

  function getFrom(meta)
  {
    return new From(db, escaper, meta);
  }

  describe('Select constructor test suite.', function()
  {
    // Checks the constructor.
    it('checks the constructor.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec);
      }).not.toThrow();
    });

    // Checks the basic getters.
    it('checks the basic getters.', function()
    {
      var sel = new Select(getFrom({table: 'users'}), qryExec);

      expect(sel.getDatabase()).toBe(db);
      expect(sel.getEscaper()).toBe(escaper);
      expect(sel.getQueryExecuter()).toBe(qryExec);
    });
  });

  describe('Select select test suite.', function()
  {
    // Checks that a basic select without columns specified is correct.
    it('checks that a basic select without columns specified is correct.', function()
    {
      var query = new Select(getFrom('users'), qryExec);

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Selects with a table alias.
    it('selects with a table alias.', function()
    {
      var query = new Select(getFrom({table: 'users', as: 'admins'}), qryExec);

      expect(query.toString()).toBe
      (
        'SELECT  `admins`.`userID` AS `admins.ID`, `admins`.`firstName` AS `admins.first`, `admins`.`lastName` AS `admins.last`\n' +
        'FROM    `users` AS `admins`'
      );
    });
      
    // Checks that a basic select with columns specified is correct.
    it('checks that a basic select with columns specified is correct.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select(['users.userID', 'users.firstName', 'users.lastName']);

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that select can be called variadicly.
    it('checks that select can be called variadicly.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName');

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that select can be called with no arguments to select all.
    it('checks that select can be called with no arguments to select all.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec).select();

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that select cannot be run twice on the same from.
    it('checks that select cannot be run twice on the same from.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .select(['users.userID', 'users.firstName', 'users.lastName']);
      }).toThrowError('select already performed on query.');
    });

    // Tries to select an invalid column.
    it('tries to select an invalid column.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec).select('userID'); // Should be users.userID.
      }).toThrowError('The column name userID is not available for selection.  ' +
        'Column names must be fully-qualified (<table-alias>.<column-name>).');
    });

    // Makes sure that the primary key is required when selecting.
    it('makes sure that the primary key is required when selecting.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec).select('users.firstName');
      }).toThrowError('If a column is selected from a table, then the primary key ' +
        'from that table must also be selected.  The primary key of table users ' +
        'is not present in the array of selected columns.');

      expect(function()
      {
        var from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('users.userID', 'users.firstName', 'phoneNumbers.phoneNumber');
      }).toThrowError('If a column is selected from a table, then the primary key ' +
        'from that table must also be selected.  The primary key of table phoneNumbers ' +
        'is not present in the array of selected columns.');
    });

    // Make sure that the primary key is only required if columns from a table are selected.
    it('make sure that the primary key is only required if columns from a table are selected.', function()
    {
      expect(function()
      {
        var from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('users.userID', 'users.firstName');
      }).not.toThrow();
    });

    // Checks that the primary key of the from table is always required.
    it('checks that the primary key of the from table is always required.', function()
    {
      expect(function()
      {
        var from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('phoneNumbers.phoneNumberID');
      }).toThrowError('The primary key of the from table is required.');
    });

    // Checks that columns can have custom aliases.
    it('checks that columns can have custom aliases.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', {column: 'users.firstName', as: 'name'});

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.name`\n' +
        'FROM    `users` AS `users`'
      );
    });

    // Checks that the same alias cannot be specified twice.
    it('checks that the same alias cannot be specified twice.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', {column: 'users.firstName', as: 'name'}, {column: 'users.lastName', as: 'name'});
      }).toThrowError('Column alias users.name already selected.');
    });

    // Checks that the same column cannot be selected twice.
    it('checks that the same column cannot be selected twice.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', {column: 'users.firstName', as: 'name'}, {column: 'users.firstName', as: 'name2'});
      }).toThrowError('Column users.firstName already selected.');
    });
  });

  describe('Select execute test suite.', function()
  {
    var Schema = require('../datamapper/Schema');
    var schemata, SchemaProxy;

    beforeEach(function()
    {
      // Proxy calls to Schema so that they can be tracked.
      schemata = [];
      SchemaProxy = function()
      {
        Schema.apply(this, arguments);
        schemata.push(this);
      };
      SchemaProxy.prototype = Object.create(Schema.prototype);
      SchemaProxy.prototype.constructor = Schema;
    });

    // Make sure that the schema for each pk gets created.
    it('make sure that the schema for each pk gets created.', function()
    {
      // Single table, one schema.
      new Select(getFrom({table: 'users'}), qryExec)
        .execute(SchemaProxy);

      expect(schemata.length).toBe(1);
      expect(schemata[0].getKeyColumnName()).toBe('users.ID');

      // Two tables, two schema.
      schemata.length = 0;

      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});

      new Select(from, qryExec).execute(SchemaProxy);

      expect(schemata.length).toBe(2);
      expect(schemata[0].getKeyColumnName()).toBe('users.ID');
      expect(schemata[1].getKeyColumnName()).toBe('phoneNumbers.ID');
    });

    // Checks that the properties from each table get added to the schemata.
    it('checks that the properties from each table get added to the schemata.', function()
    {
      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});
        
      new Select(from, qryExec).execute(SchemaProxy);

      expect(schemata[0].getProperties().length).toBe(3);
      expect(schemata[0].getProperties()[0]).toEqual({columnName: 'users.ID',    propertyName: 'ID',    convert: undefined});
      expect(schemata[0].getProperties()[1]).toEqual({columnName: 'users.first', propertyName: 'first', convert: undefined});
      expect(schemata[0].getProperties()[2]).toEqual({columnName: 'users.last',  propertyName: 'last',  convert: undefined});

      expect(schemata[1].getProperties().length).toBe(4);
      expect(schemata[1].getProperties()[0]).toEqual({columnName: 'phoneNumbers.ID',          propertyName: 'ID',          convert: undefined});
      expect(schemata[1].getProperties()[1]).toEqual({columnName: 'phoneNumbers.userID',      propertyName: 'userID',      convert: undefined});
      expect(schemata[1].getProperties()[2]).toEqual({columnName: 'phoneNumbers.phoneNumber', propertyName: 'phoneNumber', convert: undefined});
      expect(schemata[1].getProperties()[3]).toEqual({columnName: 'phoneNumbers.type',        propertyName: 'type',        convert: undefined});
    });

    // Checks that converter functions can be added.
    it('checks that converter functions can be added.', function()
    {
      var convert = jasmine.createSpy('convert');

      new Select(getFrom({table: 'users'}), qryExec)
        .select({column: 'users.userID', convert: convert}, {column: 'users.firstName', convert: convert})
        .execute(SchemaProxy);

      expect(schemata[0].getProperties()[0].columnName).toBe('users.ID');
      expect(schemata[0].getProperties()[0].convert).toBe(convert);
      expect(schemata[0].getProperties()[1].columnName).toBe('users.first');
      expect(schemata[0].getProperties()[1].convert).toBe(convert);

      // Not called.  This spec only checks that the converter can be set.
      expect(convert.calls.count()).toBe(0);
    });

    // Checks that converters can be added in the database definition.
    it('checks that converters can be added in the database definition.', function()
    {
      var bitConverter = require('../converter/bitConverter');

      new Select(getFrom({table: 'products'}), qryExec)
        .select('products.productID', 'products.isActive')
        .execute(SchemaProxy);

      expect(schemata[0].getProperties()[0].columnName).toBe('products.productID');
      expect(schemata[0].getProperties()[0].convert).toBeUndefined();
      expect(schemata[0].getProperties()[1].columnName).toBe('products.isActive');
      expect(schemata[0].getProperties()[1].convert).toBe(bitConverter.onRetrieve);
    });

    // Checks schema parents.
    it('checks schema parents.', function()
    {
      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});
      new Select(from, qryExec).execute(SchemaProxy);

      expect(schemata[0].getSchemata().length).toBe(1);
      expect(schemata[0].getSchemata()[0].propertyName).toBe('phoneNumbers');
      expect(schemata[0].getSchemata()[0].schema).toBe(schemata[1]);
    });

    // Checks two independent schemata.
    it('checks two independent schemata.', function()
    {
      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers'});
      new Select(from, qryExec).execute(SchemaProxy);

      expect(schemata.length).toBe(2);
      expect(schemata[0].getKeyColumnName()).toBe('users.ID');
      expect(schemata[1].getKeyColumnName()).toBe('phoneNumbers.ID');
    });

    // Checks that the query gets executed.
    it('checks that the query gets executed.', function()
    {
      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});
      new Select(from, qryExec).execute();

      expect(qryExec.select).toHaveBeenCalled();
    });

    // Checks that the query gets serialized.
    it('checks that the query gets serialized.', function()
    {
      // Dummy response from the query executer.
      qryExec.select.and.callFake(function(query, callback)
      {
        var result =
        [
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 11, 'phoneNumbers.phoneNumber': '111-111-1111'},
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 12, 'phoneNumbers.phoneNumber': '222-222-3333'},
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 13, 'phoneNumbers.phoneNumber': '333-444-4444'}
        ];

        callback(null, result);
      });
      
      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers', parent: 'users', on: {$eq: {'users.userID':'phoneNumbers.userID'}}});
      new Select(from, qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName', 'phoneNumbers.phoneNumberID', 'phoneNumbers.phoneNumber')
        .execute()
        .then(function(result)
        {
          expect(result.users.length).toBe(1);
          expect(result.users[0].phoneNumbers.length).toBe(3);
        });
    });

    // Checks that columns can be converted using a convert function.
    it('checks that columns can be converted using a convert function.', function()
    {
      function idConvert(id)
      {
        return id + 10;
      }

      function ucConvert(str)
      {
        return str.toUpperCase();
      }

      // Dummy response from the query executer.
      qryExec.select.and.callFake(function(query, callback)
      {
        var result =
        [
          {'users.ID': 1, 'users.first': 'joe'},
          {'users.ID': 2, 'users.first': 'jane'}
        ];

        callback(null, result);
      });

      new Select(getFrom({table: 'users'}), qryExec)
        .select({column: 'users.userID', convert: idConvert}, {column: 'users.firstName', convert: ucConvert})
        .execute()
        .then(function(result)
        {
          expect(result.users.length).toBe(2);
          expect(result.users[0].ID).toBe(11);
          expect(result.users[1].ID).toBe(12);
          expect(result.users[0].first).toBe('JOE');
          expect(result.users[1].first).toBe('JANE');
        });
    });

    // Checks that two separate schemata can be serialized.
    it('checks that two separate schemata can be serialized.', function()
    {
      // Dummy response from the query executer.
      qryExec.select.and.callFake(function(query, callback)
      {
        var result =
        [
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 11, 'phoneNumbers.phoneNumber': '111-111-1111'},
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 12, 'phoneNumbers.phoneNumber': '222-222-3333'},
          {'users.ID': 1, 'users.first': 'joe', 'users.last': 'smith', 'phoneNumbers.ID': 13, 'phoneNumbers.phoneNumber': '333-444-4444'}
        ];

        callback(null, result);
      });

      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', as: 'phoneNumbers'});
      new Select(from, qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName', 'phoneNumbers.phoneNumberID', 'phoneNumbers.phoneNumber')
        .execute()
        .then(function(result)
        {
          expect(result.users.length).toBe(1);
          expect(result.phoneNumbers.length).toBe(3);
        });
    });

    // Checks that errors can be handled.
    it('checks that errors can be handled.', function()
    {
      qryExec.select.and.callFake(function(query, callback)
      {
        callback('ERROR OCCURRED');
      });
      new Select(getFrom({table: 'users'}), qryExec)
        .execute()
        .catch(function(err)
        {
          expect(err).toBe('ERROR OCCURRED');
        });
    });

    // Checks that relationship type is respected.
    it('checks that relationship type is respected.', function()
    {
      // Dummy response from the query executer.
      qryExec.select.and.callFake(function(query, callback)
      {
        var result =
        [
          {'user.ID': 1, 'phoneNumbers.ID': 11, 'phoneNumbers.userID': 1},
          {'user.ID': 1, 'phoneNumbers.ID': 12, 'phoneNumbers.userID': 1},
          {'user.ID': 2, 'phoneNumbers.ID': 13, 'phoneNumbers.userID': 2}
        ];

        callback(null, result);
      });

      var from = getFrom({table: 'phone_numbers', as: 'phoneNumbers'})
        .innerJoin
        ({
          table:   'users',
          as:      'user',
          parent:  'phoneNumbers',
          on:      {$eq: {'phoneNumbers.userID':'user.userID'}},
          relType: 'single'
        });

      new Select(from, qryExec)
        .select('phoneNumbers.phoneNumberID', 'user.userID')
        .execute()
        .then(function(result)
        {
          expect(result.phoneNumbers.length).toBe(3);

          // 'user' is an object, not an array.
          expect(result.phoneNumbers[0].user.ID).toBe(1);
          expect(result.phoneNumbers[1].user.ID).toBe(1);
          expect(result.phoneNumbers[2].user.ID).toBe(2);
        });
    });

    // Checks that if no columns are selected from a table, then the table is optional.
    it('checks that if no columns are selected from a table, then the table is optional.', function()
    {
      // Dummy response from the query executer.
      qryExec.select.and.callFake(function(query, callback)
      {
        var result =
        [
          {'users.ID': 1, 'users.first': 'joe'},
          {'users.ID': 2, 'users.first': 'sue'},
          {'users.ID': 3, 'users.first': 'bob'}
        ];

        callback(null, result);
      });

      var from = getFrom({table: 'users'})
        .innerJoin({table: 'phone_numbers', parent: 'users'});
      new Select(from, qryExec)
        .select('users.userID', 'users.firstName')
        .execute()
        .then(function(result)
        {
          expect(result).toEqual
          ({
            users:
            [
              {ID: 1, first: 'joe'},
              {ID: 2, first: 'sue'},
              {ID: 3, first: 'bob'}
            ]
          });
        });
    });
  });

  describe('Select orderBy test suite.', function()
  {
    // Checks that orderBy can only be called once.
    it('checks that orderBy can only be called once.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .orderBy('users.firstName')
          .orderBy('users.firstName');
      }).toThrowError('orderBy already performed on query.');
    });

    // Checks that the column property is required.
    it('checks that the column property is required.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .orderBy({});
      }).toThrowError('orderBy column is required.');
    });

    // Checks that the direction must be either ASC or DESC.
    it('checks that the direction must be either ASC or DESC.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .orderBy({column: 'users.firstName', dir: 'FOO'});
      }).toThrowError('dir must be either "ASC" or "DESC."');
    });

    // Checks that only available columns can be selected.
    it('checks that only available columns can be selected.', function()
    {
      expect(function()
      {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(['users.userID', 'users.firstName', 'users.lastName'])
          .orderBy('bad.column');
      }).toThrowError('"bad.column" is not available for orderBy.');
    });

    // Checks a basic orderBy on a single column.
    it('checks a basic orderBy on a single column.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select(['users.userID', 'users.firstName', 'users.lastName'])
        .orderBy('users.firstName');

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users.firstName` ASC'
      );
    });

    // Checks orderBy on multiple columns.
    it('checks orderBy on multiple columns.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select(['users.userID', 'users.firstName', 'users.lastName'])
        .orderBy('users.userID', 'users.firstName', 'users.lastName');

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users.userID` ASC, `users.firstName` ASC, `users.lastName` ASC'
      );
    });

    // Checks orderBy using an array (instead of variadic).
    it('checks orderBy using an array (instead of variadic).', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select(['users.userID', 'users.firstName', 'users.lastName'])
        .orderBy(['users.userID', 'users.firstName', 'users.lastName']);

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users.userID` ASC, `users.firstName` ASC, `users.lastName` ASC'
      );
    });

    // Checks the orderBy with multiple directions.
    it('checks the orderBy with multiple directions.', function()
    {
      var query = new Select(getFrom({table: 'users'}), qryExec)
        .select(['users.userID', 'users.firstName', 'users.lastName'])
        .orderBy({column: 'users.userID'}, {column: 'users.firstName', dir: 'ASC'}, {column: 'users.lastName', dir: 'DESC'});

      expect(query.toString()).toBe
      (
        'SELECT  `users`.`userID` AS `users.ID`, `users`.`firstName` AS `users.first`, `users`.`lastName` AS `users.last`\n' +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users.userID` ASC, `users.firstName` ASC, `users.lastName` DESC'
      );
    });
  });
});

