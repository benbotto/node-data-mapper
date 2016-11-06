describe('TableMetaList()', function() {
  'use strict';

  const insulin       = require('insulin');
  const db            = insulin.get('ndm_testDB');
  const TableMetaList = insulin.get('ndm_TableMetaList');
  let tables;

  beforeEach(function() {
    tables = new TableMetaList(db);
  });

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('stores the database.', function() {
      expect(tables.database).toBe(db);
    });

    it('exposes a Map of table meta.', function() {
      expect(tables.tableMetas instanceof Map).toBe(true);
    });

    it('exposes a Map of available column meta.', function() {
      expect(tables.availableCols instanceof Map).toBe(true);
    });

    it('exposes a mapping hierarchy Map.', function() {
      expect(tables.mapHierarchy instanceof Map).toBe(true);
    });
  });

  /**
   * Add table.
   */
  describe('.addTable()', function() {
    describe('error handling -', function() {
      it('throws an error if the table is not provided.', function() {
        expect(function() {
          tables.addTable({});
        }).toThrowError('table is required.');
      });

      it('throws an error if the table alias contains non-word characters.', function() {
        expect(function() {
          tables.addTable({table: 'users', as: 'users alias'});
        }).toThrowError('Alises must only contain word characters.');

        expect(function() {
          tables.addTable({table: 'users', as: 'users.alias'});
        }).toThrowError('Alises must only contain word characters.');
      });

      it('throws an error if a parent is supplied which does not match a table alias.', function() {
        expect(function() {
          tables.addTable({table: 'phone_numbers', parent: 'BAD_NAME'});
        }).toThrowError('Parent table alias "BAD_NAME" is not a valid table alias.');
      });

      it('throws an error if a table alias has already been used.', function() {
        expect(function() {
          tables
            .addTable({table: 'users', as: 'u', mapTo: 'users'})
            .addTable({table: 'users', as: 'u', mapTo: 'folks'});
        }).toThrowError('The table alias "u" is not unique.');
      });

      it('throws an error if the mapTo is already used at the top level.', function() {
        expect(function() {
          tables
            .addTable({table: 'users', as: 'u1', mapTo: 'users'})
            .addTable({table: 'users', mapTo: 'users'});
        }).toThrowError('The mapping "users" is not unique.');
      });

      it('throws an error if the mapTo is already used for a given parent.', function() {
        expect(function() {
          tables
            .addTable({table: 'users', as: 'u1', mapTo: 'users'})
            .addTable({table: 'users', as: 'u2', mapTo: 'users'});
        }).toThrowError('The mapping "users" is not unique.');
      });

      it('allows the same mapTo provided the parent is different.', function() {
        expect(function() {
          tables
            .addTable({table: 'users', as: 'u'})
            .addTable({table: 'phone_numbers', as: 'pn1', mapTo: 'phone', parent: 'u'})
            .addTable({table: 'phone_numbers', as: 'pn2', mapTo: 'phone', parent: 'u'});
        }).toThrowError('The mapping "phone" is not unique.');
      });

      it('allows the same mapTo if one is top-level and one is not.', function() {
        expect(function() {
          tables.addTable({table: 'users', as: 'u'})
            .addTable({table: 'phone_numbers', as: 'pn', mapTo: 'phone', parent: 'u'})
            .addTable({table: 'users',         as: 'u2', mapTo: 'users', parent: 'pn'});
        }).not.toThrow();
      });

      it('allows the same table to be nested twice under the same table if the mapTo is unique.',
        function() {
        expect(function() {
          tables.addTable({table: 'users', as: 'u'})
            .addTable({table: 'phone_numbers', as: 'pn1', mapTo: 'phone',  parent: 'u'})
            .addTable({table: 'phone_numbers', as: 'pn2', mapTo: 'phone2', parent: 'u'});
        }).not.toThrow();
      });
    });

    describe('table meta -', function() {
      it('uses the table name for the alias if no alias is provided.', function() {
        expect(tables.tableMetas.has('users')).toBe(false);
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.has('users')).toBe(true);
      });

      it('uses the supplied alias when present.', function() {
        expect(tables.tableMetas.has('u')).toBe(false);
        tables.addTable({table: 'users', as: 'u'});
        expect(tables.tableMetas.has('u')).toBe(true);
      });

      it('uses the mapTo from the table if no mapTo is provided.', function() {
        tables.addTable({table: 'users', as: 'u'});
        expect(tables.tableMetas.get('u').mapTo).toBe('users');
      });

      it('uses the supplied mapTo when present.', function() {
        tables.addTable({table: 'users', as: 'u', mapTo: 'folks'});
        expect(tables.tableMetas.get('u').mapTo).toBe('folks');
      });

      it('stores the Table instance.', function() {
        const Table = insulin.get('ndm_Table');
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.get('users').table instanceof Table).toBe(true);
      });

      it('sets the cond to null if not provided.', function() {
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.get('users').cond).toBeNull();
      });

      it('stores the cond if provided.', function() {
        const cond = {$eq: {'users.userID': 3}};
        tables.addTable({table: 'users', cond});
        expect(tables.tableMetas.get('users').cond).toBe(cond);
      });

      it('sets the joinType to null if not provided.', function() {
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.get('users').joinType).toBe(null);
      });

      it('stores the joinType if provided.', function() {
        tables.addTable({table: 'users', joinType: 'INNER JOIN'});
        expect(tables.tableMetas.get('users').joinType).toBe('INNER JOIN');
      });

      it('sets the parent to null if not provided.', function() {
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.get('users').parent).toBe(null);
      });

      it('stores the parent if provided.', function() {
        tables
          .addTable({table: 'users'})
          .addTable({table: 'phone_numbers', parent: 'users'});
        expect(tables.tableMetas.get('phone_numbers').parent).toBe('users');
      });

      it('sets the relType to "many" if not provided.', function() {
        tables.addTable({table: 'users'});
        expect(tables.tableMetas.get('users').relType).toBe('many');
      });

      it('stores the relType if provided.', function() {
        tables
          .addTable({table: 'users'})
          .addTable({table: 'phone_numbers', parent: 'users', relType: 'many'});
        expect(tables.tableMetas.get('phone_numbers').relType).toBe('many');
      });
    });

    describe('map hierarchy -', function() {
      it('exposes the mapping hierarchy for all tables.', function() {
        tables
          .addTable({table: 'users', as: 'c', mapTo: 'children'})
          .addTable({table: 'users', as: 'a', mapTo: 'adults'})
          .addTable({table: 'users', as: 'p', mapTo: 'parents', parent: 'c'})
          .addTable({table: 'phone_numbers',  as: 'cpn', mapTo: 'phoneNumbers', parent: 'c'})
          .addTable({table: 'phone_numbers',  as: 'apn', mapTo: 'phoneNumbers', parent: 'a'});

        expect(Array.from(tables.mapHierarchy.get(null))).toEqual(['children', 'adults']);
        expect(Array.from(tables.mapHierarchy.get('c'))).toEqual(['parents', 'phoneNumbers']);
        expect(Array.from(tables.mapHierarchy.get('a'))).toEqual(['phoneNumbers']);
        expect(Array.from(tables.mapHierarchy.get('cpn'))).toEqual([]);
        expect(Array.from(tables.mapHierarchy.get('apn'))).toEqual([]);
      });
    });

    describe('available columns -', function() {
      it('exposes the table alias, column, and FQ name of each column in the table.', function() {
        let colMeta;
        tables.addTable({table: 'users', as: 'u'});

        colMeta = tables.availableCols.get('u.firstName');

        expect(colMeta.tableAlias).toBe('u');
        expect(colMeta.column.name).toBe('firstName');
        expect(colMeta.column.mapTo).toBe('first');
        expect(colMeta.fqColName).toBe('u.firstName');
      });
    });
  });

  /**
   * Is column available.
   */
  describe('.isColumnAvailable()', function() {
    it('returns true when a column is available.', function() {
      tables.addTable({table: 'users'});
      expect(tables.isColumnAvailable('users.firstName')).toBe(true);
      expect(tables.isColumnAvailable('users.lastName')).toBe(true);
    });

    it('returns false when a column is not available.', function() {
      tables.addTable({table: 'users'});
      expect(tables.isColumnAvailable('users.other')).toBe(false);
    });
  });
});

