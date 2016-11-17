describe('Select()', function() {
  'use strict';

  let insulin, escaper, qryExec, db, Select;

  beforeEach(function() {
    // New instance of insulin each time because dependencies are mocked out in
    // some tests, and needed intact in others.
    insulin = require('insulin').mock();

    const MySQLEscaper = insulin.get('ndm_MySQLEscaper');

    escaper = new MySQLEscaper();
    qryExec = jasmine.createSpyObj('qryExec', ['select']);
    db      = insulin.get('ndm_testDB');
  });

  function getFrom(meta) {
    const From = insulin.get('ndm_From');
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    beforeEach(() => Select = insulin.get('ndm_Select'));

    it('can be initialized using a From instance and a QueryExecuter.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec);
      }).not.toThrow();
    });

    it('exposes the database, escaper, and queryExecuter as properties.', function() {
      const sel = new Select(getFrom({table: 'users'}), qryExec);

      expect(sel.database).toBe(db);
      expect(sel.escaper).toBe(escaper);
      expect(sel.queryExecuter).toBe(qryExec);
    });
  });

  /**
   * Convert to string.
   */
  describe('.toString()', function() {
    beforeEach(() => Select = insulin.get('ndm_Select'));

    it('selects all columns if columns are not explicitly selected.', function() {
      const query = new Select(getFrom('users'), qryExec);

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`');
    });

    it('allows tables to be aliased.', function() {
      const query = new Select(getFrom({table: 'users', as: 'admins'}), qryExec);

      expect(query.toString()).toBe(
        'SELECT  `admins`.`userID` AS `admins.ID`,\n'       +
        '        `admins`.`firstName` AS `admins.first`,\n' +
        '        `admins`.`lastName` AS `admins.last`\n'    +
        'FROM    `users` AS `admins`');
    });
      
    it('lets columns be selected explicitly.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName');

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`');
    });
  });

  /**
   * Select.
   */
  describe('.select()', function() {
    beforeEach(() => Select = insulin.get('ndm_Select'));

    it('does not require any arguments.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec).select();

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`');
    });

    it('cannot be called twice on the same query.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', 'users.firstName', 'users.lastName')
          .select('users.userID', 'users.firstName', 'users.lastName');
      }).toThrowError('select already performed on query.');
    });

    it('throws an error if one of the selected columns is invalid.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec).select('userID'); // Should be users.userID.
      }).toThrowError('The column name userID is not available for selection.  ' +
        'Column names must be fully-qualified (<table-alias>.<column-name>).');
    });

    it('throws an error if the primary key of the from table is not selected.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec).select('users.firstName');
      }).toThrowError('If a column is selected from a table, then the primary key ' +
        'from that table must also be selected.  The primary key of table "users" ' +
        '(alias "users") is not present in the array of selected columns.');
    });

    it('always requires the primary key of the from table, even if joins are used.', function() {
      expect(function() {
        const from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('phone_numbers.phoneNumberID');
      }).toThrowError('The primary key of the from table is required.');
    });

    it('throws an error if columns are selected from a joined table, but the primary key of that table is excluded.', function() {
      expect(function() {
        const from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('users.userID', 'users.firstName', 'phone_numbers.phoneNumber');
      }).toThrowError('If a column is selected from a table, then the primary key ' +
        'from that table must also be selected.  The primary key of table "phone_numbers" ' +
        '(alias "phone_numbers") is not present in the array of selected columns.');
    });

    it('requires the primary key from joined tables only if other columns are selected from that table.', function() {
      expect(function() {
        const from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});

        new Select(from, qryExec)
          .select('users.userID', 'users.firstName');
      }).not.toThrow();
    });

    it('allows columns to be mapped to custom property names.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', {column: 'users.firstName', mapTo: 'name'});

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'     +
        '        `users`.`firstName` AS `users.name`\n' +
        'FROM    `users` AS `users`');
    });

    it('throws an error if the same column mapping is used twice.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select(
            'users.userID',
            {column: 'users.firstName', mapTo: 'name'},
            {column: 'users.lastName', mapTo: 'name'});
      }).toThrowError('Column alias users.name already selected.');
    });

    it('throw an error if the same column is selected twice.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', {column: 'users.firstName', mapTo: 'name'}, {column: 'users.firstName', mapTo: 'name2'});
      }).toThrowError('Column users.firstName already selected.');
    });
  });

  /**
   * Execute.
   */
  describe('.execute()', function() {
    it('executes the query using the QueryExecuter\'s select() method.', function() {
      const from = getFrom({table: 'users'});
      new Select(from, qryExec).execute();
      expect(qryExec.select).toHaveBeenCalled();
    });

    /**
     * Schema building tests.
     */
    describe('schema building -', function() {
      let Schema;

      beforeEach(function() {
        // Spy on the Schema constructor.
        Schema = jasmine.createSpy('Schema');
        Schema.RELATIONSHIP_TYPE = {MANY: 'many', SINGLE: 'single'};

        // Properties and sub schemata are added to the top-level schema, so
        // track calls to those.
        Schema.prototype = {
          addProperty: jasmine.createSpy(),
          addSchema:   jasmine.createSpy()
        };

        insulin.factory('ndm_Schema', () => Schema);
        Select = insulin.get('ndm_Select');
      });

      it('creates a Schema with the primary key for the keyColumnName and the mapTo for the propertyName.', function() {
        // Single table, one schema.
        new Select(getFrom({table: 'users'}), qryExec)
          .execute();

        expect(Schema.calls.count()).toBe(1);
        expect(Schema).toHaveBeenCalledWith('users.ID', 'ID', undefined);
      });

      it('creates a Schema for each table.', function() {
        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({
            table:  'phone_numbers',
            as:     'pn',
            parent: 'u',
            on:     {$eq: {'u.userID':'pn.userID'}}
          });

        new Select(from, qryExec).execute();

        expect(Schema.calls.count()).toBe(2);
        expect(Schema.calls.argsFor(0)).toEqual(['u.ID',  'ID', undefined]);
        expect(Schema.calls.argsFor(1)).toEqual(['pn.ID', 'ID', undefined]);
        expect(Schema.prototype.addSchema.calls.count()).toBe(1);
        expect(Schema.prototype.addSchema.calls.argsFor(0)[0]).toBe('phoneNumbers');
      });

      it('adds the mapping properties from each table to the schemata.', function() {
        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({
            table:  'phone_numbers',
            as:     'pn',
            parent: 'u',
            on:     {$eq: {'u.userID':'pn.userID'}}
          });
          
        new Select(from, qryExec).execute();

        expect(Schema.prototype.addProperty.calls.count()).toBe(5);
        expect(Schema.prototype.addProperty.calls.allArgs()).toEqual([
          ['u.first',        'first',       undefined],
          ['u.last',         'last',        undefined],
          ['pn.userID',      'userID',      undefined],
          ['pn.phoneNumber', 'phoneNumber', undefined],
          ['pn.type',        'type',        undefined]
        ]);
      });

      it('passes column converters to the Schema.', function() {
        const convert = {};

        new Select(getFrom({table: 'users', as: 'u'}), qryExec)
          .select(
            {column: 'u.userID',    convert: convert},
            {column: 'u.firstName', convert: convert})
          .execute();

        expect(Schema.calls.count()).toBe(1);
        expect(Schema).toHaveBeenCalledWith('u.ID', 'ID', convert);
        expect(Schema.prototype.addProperty.calls.count()).toBe(1);
        expect(Schema.prototype.addProperty.calls.argsFor(0))
          .toEqual(['u.first', 'first', convert]);
      });

      it('uses converters from the database schema.', function() {
        const bitConverter = insulin.get('ndm_bitConverter');

        new Select(getFrom({table: 'products'}), qryExec)
          .select('products.productID', 'products.isActive')
          .execute();

        expect(Schema.prototype.addProperty.calls.count()).toBe(1);
        expect(Schema.prototype.addProperty.calls.argsFor(0))
          .toEqual(['products.isActive', 'isActive', bitConverter.onRetrieve]);
      });

      it('creates sub-schemata with the correct parent.', function() {
        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({
            table:  'phone_numbers',
            as:     'pn',
            parent: 'u',
            on:     {$eq: {'u.userID':'pn.userID'}}})
          .innerJoin({
            table:  'phone_numbers',
            as:     'pn2',
            mapTo:  'phones',
            parent: 'u',
            on:     {$eq: {'u.userID':'pn2.userID'}}});
        new Select(from, qryExec).execute();

        expect(Schema.prototype.addSchema.calls.count()).toBe(2);
        // mapTo from the schema.
        expect(Schema.prototype.addSchema.calls.argsFor(0)[0]).toBe('phoneNumbers');
        // mapTo added manually.
        expect(Schema.prototype.addSchema.calls.argsFor(1)[0]).toBe('phones');
      });

      it('creates multiple top-level schema if a joined table has no parent.', function() {
        const from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', as: 'phoneNumbers'});
        new Select(from, qryExec).execute();

        expect(Schema.calls.count()).toBe(2);
        expect(Schema.prototype.addSchema.calls.count()).toBe(0);
      });

      it('allows the relationship type (relType) to be set on joins.', function() {
        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({
            table:   'phone_numbers',
            as:      'pn',
            parent:  'u',
            relType: 'single',
            on:      {$eq: {'u.userID':'pn.userID'}}});
        new Select(from, qryExec).execute();

        expect(Schema.prototype.addSchema.calls.count()).toBe(1);
        expect(Schema.prototype.addSchema.calls.argsFor(0)[2]).toEqual('single');
      });
    });

    /**
     * Data mapping tests.
     */
    describe('data mapping -', function() {
      let DataMapper;

      beforeEach(function() {
        DataMapper = insulin.get('ndm_DataMapper');
        Select     = insulin.get('ndm_Select');
        spyOn(DataMapper.prototype, 'serialize').and.callThrough();
      });

      it('maps the results to a normalized object using a DataMapper instance.', function() {
        // Dummy response from the query executer.
        qryExec.select.and.callFake(function(query, callback) {
          const result = [
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 11, 'pn.phoneNumber': '111-111-1111'},
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 12, 'pn.phoneNumber': '222-222-3333'},
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 13, 'pn.phoneNumber': '333-444-4444'}
          ];

          callback(null, result);
        });
        
        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({
            table:  'phone_numbers',
            as:     'pn',
            parent: 'u',
            on:     {$eq: {'u.userID':'pn.userID'}}});
        new Select(from, qryExec)
          .select('u.userID', 'u.lastName', 'pn.phoneNumberID', 'pn.phoneNumber')
          .execute()
          .then(function(result) {
            expect(result.users.length).toBe(1);
            expect(result.users[0].phoneNumbers.length).toBe(3);
          })
          .catch(() => expect(true).toBe(false));
      });

      it('serializes multiple top-level schemata.', function() {
        qryExec.select.and.callFake(function(query, callback) {
          const result = [
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 11, 'pn.phoneNumber': '111-111-1111'},
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 12, 'pn.phoneNumber': '222-222-3333'},
            {'u.ID': 1, 'u.last': 'smith', 'pn.ID': 13, 'pn.phoneNumber': '333-444-4444'}
          ];

          callback(null, result);
        });

        const from = getFrom({table: 'users', as: 'u'})
          .innerJoin({table: 'phone_numbers', as: 'pn'});
        new Select(from, qryExec)
          .select('u.userID', 'u.lastName', 'pn.phoneNumberID', 'pn.phoneNumber')
          .execute()
          .then(function(result) {
            expect(result.users.length).toBe(1);
            expect(result.phoneNumbers.length).toBe(3);
          })
          .catch(() => expect(true).toBe(false));
      });

      it('propagates errors that originate in the QueryExecuter.', function() {
        qryExec.select.and.callFake(function(query, callback) {
          callback('ERROR OCCURRED');
        });
        new Select(getFrom({table: 'users'}), qryExec)
          .execute()
          .then(() => expect(true).toBe(false))
          .catch(err => expect(err).toBe('ERROR OCCURRED'));
      });

      it('checks that relationship type is respected.', function() {
        qryExec.select.and.callFake(function(query, callback) {
          const result = [
            {'u.ID': 1, 'pn.ID': 11, 'pn.userID': 1},
            {'u.ID': 1, 'pn.ID': 12, 'pn.userID': 1},
            {'u.ID': 2, 'pn.ID': 13, 'pn.userID': 2}
          ];

          callback(null, result);
        });

        const from = getFrom({table: 'phone_numbers', as: 'pn'})
          .innerJoin({
            table:   'users',
            mapTo:   'user',
            as:      'u',
            parent:  'pn',
            on:      {$eq: {'pn.userID':'u.userID'}},
            relType: 'single'
          });

        new Select(from, qryExec)
          .select('pn.phoneNumberID', 'u.userID')
          .execute()
          .then(function(result) {
            expect(result.phoneNumbers.length).toBe(3);

            // 'user' is an object, not an array.
            expect(result.phoneNumbers[0].user.ID).toBe(1);
            expect(result.phoneNumbers[1].user.ID).toBe(1);
            expect(result.phoneNumbers[2].user.ID).toBe(2);
          });
      });

      it('allows a table to be excluded if no columns are selected from that table.', function() {
        qryExec.select.and.callFake(function(query, callback) {
          const result = [
            {'users.ID': 1, 'users.first': 'joe'},
            {'users.ID': 2, 'users.first': 'sue'},
            {'users.ID': 3, 'users.first': 'bob'}
          ];

          callback(null, result);
        });

        const from = getFrom({table: 'users'})
          .innerJoin({table: 'phone_numbers', parent: 'users'});
        new Select(from, qryExec)
          .select('users.userID', 'users.firstName')
          .execute()
          .then(function(result) {
            expect(result).toEqual({
              users: [
                {ID: 1, first: 'joe'},
                {ID: 2, first: 'sue'},
                {ID: 3, first: 'bob'}
              ]
            });
          });
      });
    });
  });

  /**
   * Order.
   */
  describe('.orderBy()', function() {
    it('cannot be called twice on the same query.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', 'users.firstName', 'users.lastName')
          .orderBy('users.firstName')
          .orderBy('users.firstName');
      }).toThrowError('orderBy already performed on query.');
    });

    it('throws an error if no column is provided.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', 'users.firstName', 'users.lastName')
          .orderBy({});
      }).toThrowError('orderBy column is required.');
    });

    it('throws an error if dir is not ASC or DESC.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', 'users.firstName', 'users.lastName')
          .orderBy({column: 'users.firstName', dir: 'FOO'});
      }).toThrowError('dir must be either "ASC" or "DESC."');
    });

    it('throws an error if the orderBy column is not available.', function() {
      expect(function() {
        new Select(getFrom({table: 'users'}), qryExec)
          .select('users.userID', 'users.firstName', 'users.lastName')
          .orderBy('bad.column');
      }).toThrowError('"bad.column" is not available for orderBy.');
    });

    it('adds the ORDER BY clause for a single column.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName')
        .orderBy('users.firstName');

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users`.`firstName` ASC');
    });

    it('adds the ORDER BY clause for multiple columns.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName')
        .orderBy('users.userID', 'users.firstName', 'users.lastName');

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users`.`userID` ASC, `users`.`firstName` ASC, `users`.`lastName` ASC');
    });

    it('can have multiple directions, ASC and DESC.', function() {
      const query = new Select(getFrom({table: 'users'}), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName')
        .orderBy(
          {column: 'users.userID'},
          {column: 'users.firstName', dir: 'ASC'},
          {column: 'users.lastName', dir: 'DESC'});

      expect(query.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.ID`,\n'       +
        '        `users`.`firstName` AS `users.first`,\n' +
        '        `users`.`lastName` AS `users.last`\n'    +
        'FROM    `users` AS `users`\n' +
        'ORDER BY `users`.`userID` ASC, `users`.`firstName` ASC, `users`.`lastName` DESC');
    });
  });
});

