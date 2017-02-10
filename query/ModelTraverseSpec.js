describe('ModelTraverse()', function() {
  'use strict';

  const insulin       = require('insulin');
  const ModelTraverse = insulin.get('ndm_ModelTraverse');
  const traverse      = new ModelTraverse();
  const db            = insulin.get('ndm_testDB');
  let callback;

  beforeEach(() => callback = jasmine.createSpy('callback'));

  /**
   * Model only.
   */
  describe('.modelOnly()', function() {
    it('fires the callback for a single top-level model, ignoring nested models.', function() {
      const model = {users: {name: 'joe'}};

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users,
        parent: null
      });
    });

    it('fires the callback for each model in an array.', function() {
      const model = {
        users: [
          {name: 'joe'},
          {name: 'steve'}
        ]
      };

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(2);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[1],
        parent: null
      });
    });

    it('fires the callback for each top-level model.', function() {
      const model = {
        users: [
          {name: 'joe'},
          {name: 'steve'}
        ],
        products: {name: 'Nike'}
      };

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(3);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'products',
        model: model.products,
        parent: null
      });
    });

    it('ignores model properties that are not table mappings if a Database instance is provded.',
      function() {
      const model = {
        users: {
          name: 'joe',
          phoneNumbers: {phoneNumber: '111-111-1111'} // Ignored (nested).
        },
        soups: {type: 'onion'} // Ignored (not a table mapping).
      };

      traverse.modelOnly(model, callback, db);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users,
        parent: null
      });
    });
  });

  /**
   * Depth first.
   */
  describe('.depthFirst()', function() {
    it('does not fire the callback on primitive properties.', function() {
      const obj = {name: 'joe', age: 19, hairColor: 'brown'};

      traverse.depthFirst(obj, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('fires the callback for a single-level model.', function() {
      const obj = {users: {name: 'joe', age: 19, hairColor: 'brown'}};

      traverse.depthFirst(obj, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual({tableMapping: 'users', model: obj.users, parent: null});
    });

    it('fires the callback for each model, both top-level and nested.', function() {
      const model =  {
        users: {
          name: 'joe',
          age: 19,
          hairColor: 'brown',
          phoneNumbers: [
            {
              phoneNumber: '111-222-3333',
              type: 'mobile',
              country: {countryID: 8, countryCode: 'US'}
            },
            {phoneNumber: '444-555-6666', type: 'home'}
          ]
        }
      };

      traverse.depthFirst(model, callback);
      expect(callback.calls.count()).toBe(4);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'country',
        model: model.users.phoneNumbers[0].country,
        parent: model.users.phoneNumbers[0]
      });
      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users.phoneNumbers[0],
        parent: model.users
      });
      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users.phoneNumbers[1],
        parent: model.users
      });
      expect(callback.calls.argsFor(3)[0]).toEqual({
        tableMapping: 'users',
        model: model.users,
        parent: null
      });
    });

    it('fires the callback for each top-level model.', function() {
      const model =  {
        users: [
          {
            name: 'joe',
            age: 19,
            hairColor: 'brown',
            phoneNumbers: [
              {
                phoneNumber: '111-222-3333',
                type: 'mobile',
                country: {countryID: 8, countryCode: 'US'}
              },
              {phoneNumber: '444-555-6666', type: 'home'}
            ]
          },
          {
            name: 'Haley',
            age: 29,
            hairColor: 'brown',
            phoneNumbers: [
              {phoneNumber: '777-777-7777', type: 'Mobile'}
            ]
          }
        ],
        products: [{name: 'Nike'}, {name: 'Rebok'}]
      };

      traverse.depthFirst(model, callback);
      expect(callback.calls.count()).toBe(8);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'country',
        model: model.users[0].phoneNumbers[0].country,
        parent: model.users[0].phoneNumbers[0]
      });
      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[0].phoneNumbers[0],
        parent: model.users[0]
      });
      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[0].phoneNumbers[1],
        parent: model.users[0]
      });
      expect(callback.calls.argsFor(3)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[0],
        parent: null
      });
      expect(callback.calls.argsFor(4)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: model.users[1]
      });
      expect(callback.calls.argsFor(5)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[1],
        parent: null
      });
      expect(callback.calls.argsFor(6)[0]).toEqual({
        tableMapping: 'products',
        model: model.products[0],
        parent: null
      });
      expect(callback.calls.argsFor(7)[0]).toEqual({
        tableMapping: 'products',
        model: model.products[1],
        parent: null
      });
    });

    it('ignores properties that do not match a table mapping when a Database '+
     'instance is provided.', function() {
      const model =  {
        users: {
          name: 'joe',
          foo:  {bar: 'baz'}
        }
      };

      traverse.depthFirst(model, callback, db);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users,
        parent: null
      });
    });

    it('fires the callback for each sub-model, even if the top-level model ' +
     'does not correspond to a table mapping.', function() {
      const model = {
        foo: {
          users: [
            {name: 'joe',  age: 30},
            {
              name: 'phil',
              age: 14,
              phoneNumbers: {phoneNumber: '111-111-1111'}
            }
          ]
        }
      };

      traverse.depthFirst(model, callback, db);
      expect(callback.calls.count()).toBe(3);

      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.foo.users[0],
        parent: null
      });
      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.foo.users[1].phoneNumbers,
        parent: model.foo.users[1]
      });
      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'users',
        model: model.foo.users[1],
        parent: null
      });
    });
  });

  /**
   * Breadth first.
   */
  describe('breadthFirst()', function() {
    it('does not fire the callback on primitive properties.', function() {
      const obj = {name: 'joe', age: 19, hairColor: 'brown'};

      traverse.breadthFirst(obj, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('fires the callback for a singl-level model.', function() {
      const obj = {users: {name: 'joe', age: 19, hairColor: 'brown'}};

      traverse.breadthFirst(obj, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)).toEqual([{
        tableMapping: 'users',
        model: obj.users,
        parent: {
          tableMapping: null,
          model: obj,
          parent: null
        }
      }]);
    });

    it('fires the callback for each model, both top-level and nested.', function() {
      const model =  {
        users: {
          name: 'joe',
          age: 19,
          hairColor: 'brown',
          phoneNumbers: [
            {
              phoneNumber: '111-222-3333',
              type: 'mobile',
              country: {countryID: 8, countryCode: 'US'}
            },
            {phoneNumber: '444-555-6666', type: 'home'}
          ]
        }
      };

      traverse.breadthFirst(model, callback);
      expect(callback.calls.count()).toBe(4);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users,
        parent: {
          tableMapping: null,
          model: model,
          parent: null
        }
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users.phoneNumbers[0],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users.phoneNumbers[1],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(3)[0]).toEqual({
        tableMapping: 'country',
        model: model.users.phoneNumbers[0].country,
        parent: callback.calls.argsFor(1)[0]
      });
    });

    it('fires the callback for each top-level model.', function() {
      const model =  {
        users: [
          {
            name: 'joe',
            age: 19,
            hairColor: 'brown',
            phoneNumbers: [
              {
                phoneNumber: '111-222-3333',
                type: 'mobile',
                country: {countryID: 8, countryCode: 'US'}
              },
              {phoneNumber: '444-555-6666', type: 'home'}
            ]
          },
          {
            name: 'Haley',
            age: 29,
            hairColor: 'brown',
            phoneNumbers: [
              {phoneNumber: '777-777-7777', type: 'Mobile'}
            ]
          }
        ],
        products: [{name: 'Nike'}, {name: 'Rebok'}]
      };
      
      const baseParent = {
        tableMapping: null,
        model: model,
        parent: null
      };

      traverse.breadthFirst(model, callback);
      expect(callback.calls.count()).toBe(8);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[0],
        parent: baseParent
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[1],
        parent: baseParent
      });

      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'products',
        model: model.products[0],
        parent: baseParent
      });

      expect(callback.calls.argsFor(3)[0]).toEqual({
        tableMapping: 'products',
        model: model.products[1],
        parent: baseParent
      });

      expect(callback.calls.argsFor(4)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[0].phoneNumbers[0],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(5)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[0].phoneNumbers[1],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(6)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: callback.calls.argsFor(1)[0]
      });

      expect(callback.calls.argsFor(7)[0]).toEqual({
        tableMapping: 'country',
        model: model.users[0].phoneNumbers[0].country,
        parent: callback.calls.argsFor(4)[0]
      });
    });

    it('ignores properties that do not match a table mapping when a Database ' +
      'instance is provided.', function() {
      const model = {
        users: [
          {name: 'joe',  age: 30},
          {
            name: 'phil',
            age: 14,
            phoneNumbers: [
              {phoneNumber: '111-111-1111'},
              {phoneNumber: '222-222-2222'}
            ]
          }
        ],
        foo: {bar: 'baz'}
      };

      traverse.breadthFirst(model, callback, db);

      expect(callback.calls.count()).toBe(4);
      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'users',
        model: model.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: callback.calls.argsFor(1)[0]
      });

      expect(callback.calls.argsFor(3)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.users[1].phoneNumbers[1],
        parent: callback.calls.argsFor(1)[0]
      });
    });

    it('fires the callback for each sub-model, even if the top-level model ' +
      'does not correspond to a table mapping.', function() {
      const model = {
        foo: {
          users: [
            {name: 'joe',  age: 30},
            {
              name: 'phil',
              age: 14,
              phoneNumbers: {phoneNumber: '111-111-1111'}
            }
          ]
        }
      };

      traverse.breadthFirst(model, callback, db);
      expect(callback.calls.count()).toBe(3);

      expect(callback.calls.argsFor(0)[0]).toEqual({
        tableMapping: 'users',
        model: model.foo.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual({
        tableMapping: 'users',
        model: model.foo.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual({
        tableMapping: 'phoneNumbers',
        model: model.foo.users[1].phoneNumbers,
        parent: callback.calls.argsFor(1)[0]
      });
    });
  });
});

