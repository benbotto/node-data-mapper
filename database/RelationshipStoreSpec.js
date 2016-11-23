describe('RelationshipStore()', function() {
  'use strict';

  const insulin  = require('insulin');
  const RelStore = insulin.get('ndm_RelationshipStore');
  let   relStore, testDB;

  beforeEach(function() {
    testDB   = insulin.get('ndm_testDB');
    relStore = new RelStore();
    relStore.indexRelationships(testDB);
  });

  /**
   * Index relationships.
   */
  describe('.indexRelationships()', function() {
    const testSchema = insulin.get('ndm_testDBSchema');
    const Database   = insulin.get('ndm_Database');
    let   schemaClone;

    beforeEach(function() {
      schemaClone = JSON.parse(JSON.stringify(testSchema));
      testDB      = new Database(schemaClone);
    });

    it('throws an error if a foreign key\'s owning column is invalid.', function() {
      expect(function() {
        const prods = testDB.getTableByName('products');
        prods.foreignKeys[0].column = 'fooID';
        new Database(testDB);
      }).toThrowError('Foreign key column "fooID" does not exist in table "products."');
    });

    it('throws an error if a foreign key references an invalid table.', function() {
      expect(function() {
        const prods = testDB.getTableByName('products');
        prods.foreignKeys[0].references.table = 'widgets';
        new Database(testDB);
      }).toThrowError('Referenced table "widgets" does not exist.');
    });

    it('throws an error if a foreign key references an invalid column.', function() {
      expect(function() {
        const prods = testDB.getTableByName('products');
        prods.foreignKeys[0].references.column = 'widgetID';
        new Database(testDB);
      }).toThrowError('Referenced column "widgetID" does not exist in table "photos."');
    });
  });

  /**
   * Get relationships.
   */
  describe('.getRelationships()', function() {
    it('throws an error if either table does not exist.', function() {
      expect(function() {
        relStore.getRelationships('foo', 'bar');
      }).toThrowError('foo is not indexed.');

      expect(function() {
        relStore.getRelationships('users', 'bar');
      }).toThrowError('bar is not indexed.');
    });

    it('returns an empty array for tables that do not have relationships.', function() {
      expect(relStore.getRelationships('phone_numbers', 'products')).toEqual([]);
    });

    it('doesn\'t matter what order the tables are in.', function() {
      let rels;
      
      rels = relStore.getRelationships('users', 'phone_numbers');
      expect(rels.length).toBe(1);
      expect(rels[0].name).toEqual('fk_userID_users_userID');

      rels = relStore.getRelationships('users', 'phone_numbers');
      expect(rels.length).toBe(1);
      expect(rels[0].name).toEqual('fk_userID_users_userID');
    });

    it('handles circular references.', function() {
      const rels = relStore.getRelationships('products', 'photos');

      expect(rels.length).toBe(2);
      expect(rels[0].name).toBe('fk_primaryPhotoID_photos_photoID');
      expect(rels[1].name).toBe('fk_prodID_products_productID');
    });

    it('can restrict the returned keys to those owned by the first table.', function() {
      const rels = relStore.getRelationships('products', 'photos', true);

      expect(rels.length).toBe(1);
      expect(rels[0].name).toBe('fk_primaryPhotoID_photos_photoID');
    });

    it('does not duplicate self-referencing foreign keys.', function() {
      const rels = relStore.getRelationships('photos', 'photos');
      expect(rels.length).toBe(2);
      expect(rels[0].name).toBe('fk_largeThumbnailID_photos_photoID');
      expect(rels[1].name).toBe('fk_smallThumbnailID_photos_photoID');
    });
  });
});

