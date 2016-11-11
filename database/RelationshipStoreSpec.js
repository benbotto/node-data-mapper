describe('RelationshipStore()', function() {
  'use strict';

  const insulin  = require('insulin');
  const RelStore = insulin.get('ndm_RelationshipStore');
  const testDB   = insulin.get('ndm_testDB');
  let   relStore;

  beforeEach(function() {
    relStore = new RelStore();
    relStore.indexTables(testDB.tables);
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

    it('does not duplicate self-referencing foreign keys.', function() {
      const rels = relStore.getRelationships('photos', 'photos');
      expect(rels.length).toBe(2);
      expect(rels[0].name).toBe('fk_largeThumbnailID_photos_photoID');
      expect(rels[1].name).toBe('fk_smallThumbnailID_photos_photoID');
    });
  });
});

