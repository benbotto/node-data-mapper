describe('Database()', function() {
  'use strict';

  const insulin  = require('insulin');
  const Database = insulin.get('ndm_Database');
  const Table    = insulin.get('ndm_Table');
  const testSchema = insulin.get('ndm_testDBSchema');
  let   db;

  beforeEach(function() {
    db = new Database(testSchema);
  });

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    it('only needs a name.', function() {
      const db = new Database({name: 'test'});
      expect(db.name).toBe('test');
      expect(db.tables.length).toBe(0);
    });

    it('requires a name.', function() {
      expect(function() {
        new Database({});
      }).toThrowError('Database name is required.');
    });

    it('accepts an array of tables.', function() {
      const db = new Database(testSchema);

      expect(db.name).toBe('testDB');
      expect(db.tables.length).toBe(testSchema.tables.length);
      expect(db.tables[0].name).toBe('users');
      expect(db.tables[1].name).toBe('phone_numbers');
      expect(db.tables[2].name).toBe('products');
    });

    it('keeps a RelationshipStore instance in relStore.', function() {
      const db = new Database(testSchema);
      expect(db.relStore).toBeDefined();
    });
  });

  /**
   * Get table by name.
   */
  describe('.getTableByName()', function() {
    it('can retrieve a table by name.', function() {
      expect(db.getTableByName('users').name).toBe('users');
      expect(db.getTableByName('phone_numbers').mapTo).toBe('phoneNumbers');
    });

    it('throws when trying to get a table using an invalid name.', function() {
      expect(function() {
        db.getTableByName('INVALID_NAME');
      }).toThrowError('Table INVALID_NAME does not exist in database testDB.');
    });
  });

  /**
   * Get table by mapping.
   */
  describe('.getTableByMapping()', function() {
    it('chan retrieve a table by mapping.', function() {
      expect(db.getTableByMapping('phoneNumbers').name).toBe('phone_numbers');
      expect(db.getTableByMapping('phoneNumbers')).toBe(db.getTableByName('phone_numbers'));
    });

    it('throws when trying to get a table using an invalid mapping.', function() {
      expect(function() {
        db.getTableByMapping('INVALID_MAPPING');
      }).toThrowError('Table mapping INVALID_MAPPING does not exist in database testDB.');
    });
  });

  /**
   * Is table mapping.
   */
  describe('.isTableMapping()', function() {
    it('can check if a table is valid based on its mapping.', function() {
      expect(db.isTableMapping('users')).toBe(true);
      expect(db.isTableMapping('phoneNumbers')).toBe(true);
      expect(db.isTableMapping('foo')).toBe(false);
    });
  });

  /**
   * Is table name.
   */
  describe('.isTablename()', function() {
    it('can check if a table is valid based on its name.', function() {
      expect(db.isTableName('users')).toBe(true);
      expect(db.isTableName('phone_numbers')).toBe(true);
      expect(db.isTableName('foo')).toBe(false);
    });
  });

  /**
   * Add table.
   */
  describe('.addTable()', function() {
    it('prevents duplicate tables from being added.', function() {
      expect(function() {
        db.addTable(testSchema.tables[0]);
      }).toThrowError('Table users already exists in database testDB.');

      expect(function() {
        db.addTable({name: 'foo', mapTo: 'users', columns: testSchema.tables[0].columns});
      }).toThrowError('Table mapping users already exists in database testDB.');
    });

    it('allows new tables to be added.', function() {
      const tbl = new Table({name: 'foo', columns: [{name: 'bar', isPrimary: true}]});
      expect(db.addTable(tbl)).toBe(db);
    });
  });
});

