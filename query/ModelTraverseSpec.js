xdescribe('modelTraverse test suite.', function()
{
  'use strict';

  var traverse = require('./modelTraverse');
  var Database = require('../database/Database');
  var db       = new Database(require('../spec/testDB'));
  var callback;

  beforeEach(function()
  {
    callback = jasmine.createSpy('callback');
  });

  xdescribe('modelTraverse modelOnly test suite.', function()
  {
    // Traverses a basic model.
    it('traverses a basic model.', function()
    {
      var model = {users: {name: 'joe'}};

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users,
        parent: null
      });
    });

    // Traverses an array model.
    it('traverses an array model.', function()
    {
      var model =
      {
        users:
        [
          {name: 'joe'},
          {name: 'steve'}
        ]
      };

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(2);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[1],
        parent: null
      });
    });

    // Traverses a model with multiple table aliases.
    it('traverses a model with multiple table aliases.', function()
    {
      var model =
      {
        users:
        [
          {name: 'joe'},
          {name: 'steve'}
        ],
        products: {name: 'Nike'}
      };

      traverse.modelOnly(model, callback);
      expect(callback.calls.count()).toBe(3);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'products',
        model: model.products,
        parent: null
      });
    });

    // Makes sure that non-table-alias properties are ignored when a DB is used.
    it('makes sure that non-table-alias properties are ignored when a DB is used.', function()
    {
      var model =
      {
        users:
        {
          name: 'joe',
          phoneNumbers: {phoneNumber: '111-111-1111'} // Ignored.
        },
        soups: {type: 'onion'} // Ignored.
      };

      traverse.modelOnly(model, callback, db);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users,
        parent: null
      });
    });
  });

  xdescribe('modelTraverse depthFirst test suite.', function()
  {
    // Traverses a basic object.
    it('traverses a basic object.', function()
    {
      var obj = {name: 'joe', age: 19, hairColor: 'brown'};

      traverse.depthFirst(obj, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    // Traverses with a basic model.
    it('traverses with a basic model.', function()
    {
      var obj = {users: {name: 'joe', age: 19, hairColor: 'brown'}};

      traverse.depthFirst(obj, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual({tableAlias: 'users', model: obj.users, parent: null});
    });

    // Traverses an object with a nested object.
    it('traverses an object with a nested object.', function()
    {
      var model = 
      {
        users:
        {
          name: 'joe',
          age: 19,
          hairColor: 'brown',
          phoneNumbers:
          [
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
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'country',
        model: model.users.phoneNumbers[0].country,
        parent: model.users.phoneNumbers[0]
      });
      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users.phoneNumbers[0],
        parent: model.users
      });
      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users.phoneNumbers[1],
        parent: model.users
      });
      expect(callback.calls.argsFor(3)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users,
        parent: null
      });
    });

    // Traverses an object with multiple top-level properties.
    it('traverses an object with multiple top-level properties.', function()
    {
      var model = 
      {
        users:
        [
          {
            name: 'joe',
            age: 19,
            hairColor: 'brown',
            phoneNumbers:
            [
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
            phoneNumbers:
            [
              {phoneNumber: '777-777-7777', type: 'Mobile'}
            ]
          }
        ],
        products: [{name: 'Nike'}, {name: 'Rebok'}]
      };

      traverse.depthFirst(model, callback);
      expect(callback.calls.count()).toBe(8);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'country',
        model: model.users[0].phoneNumbers[0].country,
        parent: model.users[0].phoneNumbers[0]
      });
      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[0].phoneNumbers[0],
        parent: model.users[0]
      });
      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[0].phoneNumbers[1],
        parent: model.users[0]
      });
      expect(callback.calls.argsFor(3)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[0],
        parent: null
      });
      expect(callback.calls.argsFor(4)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: model.users[1]
      });
      expect(callback.calls.argsFor(5)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[1],
        parent: null
      });
      expect(callback.calls.argsFor(6)[0]).toEqual
      ({
        tableAlias: 'products',
        model: model.products[0],
        parent: null
      });
      expect(callback.calls.argsFor(7)[0]).toEqual
      ({
        tableAlias: 'products',
        model: model.products[1],
        parent: null
      });
    });

    // Checks that keys that do not match a table alias are ignored.
    it('checks that keys that do not match a table alias are ignored.', function()
    {
      var model = 
      {
        users:
        {
          name: 'joe',
          foo:  {bar: 'baz'}
        }
      };

      traverse.depthFirst(model, callback, db);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users,
        parent: null
      });
    });

    // Checks that the parent is always a valid table alias.
    it('checks that the parent is always a valid table alias.', function()
    {
      var model =
      {
        foo:
        {
          users:
          [
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

      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.foo.users[0],
        parent: null
      });
      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.foo.users[1].phoneNumbers,
        parent: model.foo.users[1]
      });
      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.foo.users[1],
        parent: null
      });
    });
  });

  xdescribe('modelTraverse breadthFirst test suite.', function()
  {
    // Traverses a basic object.
    it('traverses a basic object.', function()
    {
      var obj = {name: 'joe', age: 19, hairColor: 'brown'};

      traverse.breadthFirst(obj, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    // Traverses with a basic model.
    it('traverses with a basic model.', function()
    {
      var obj = {users: {name: 'joe', age: 19, hairColor: 'brown'}};

      traverse.breadthFirst(obj, callback);
      expect(callback.calls.count()).toBe(1);
      expect(callback.calls.argsFor(0)).toEqual
      ([{
        tableAlias: 'users',
        model: obj.users,
        parent:
        {
          tableAlias: null,
          model: obj,
          parent: null
        }
      }]);
    });

    // Traverses an object with a nested object.
    it('traverses an object with a nested object.', function()
    {
      var model = 
      {
        users:
        {
          name: 'joe',
          age: 19,
          hairColor: 'brown',
          phoneNumbers:
          [
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
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users,
        parent:
        {
          tableAlias: null,
          model: model,
          parent: null
        }
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users.phoneNumbers[0],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users.phoneNumbers[1],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(3)[0]).toEqual
      ({
        tableAlias: 'country',
        model: model.users.phoneNumbers[0].country,
        parent: callback.calls.argsFor(1)[0]
      });
    });

    // Traverses an object with multiple top-level properties.
    it('traverses an object with multiple top-level properties.', function()
    {
      var model = 
      {
        users:
        [
          {
            name: 'joe',
            age: 19,
            hairColor: 'brown',
            phoneNumbers:
            [
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
            phoneNumbers:
            [
              {phoneNumber: '777-777-7777', type: 'Mobile'}
            ]
          }
        ],
        products: [{name: 'Nike'}, {name: 'Rebok'}]
      };
      
      var baseParent =
      {
        tableAlias: null,
        model: model,
        parent: null
      };

      traverse.breadthFirst(model, callback);
      expect(callback.calls.count()).toBe(8);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[0],
        parent: baseParent
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[1],
        parent: baseParent
      });

      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'products',
        model: model.products[0],
        parent: baseParent
      });

      expect(callback.calls.argsFor(3)[0]).toEqual
      ({
        tableAlias: 'products',
        model: model.products[1],
        parent: baseParent
      });

      expect(callback.calls.argsFor(4)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[0].phoneNumbers[0],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(5)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[0].phoneNumbers[1],
        parent: callback.calls.argsFor(0)[0]
      });

      expect(callback.calls.argsFor(6)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: callback.calls.argsFor(1)[0]
      });

      expect(callback.calls.argsFor(7)[0]).toEqual
      ({
        tableAlias: 'country',
        model: model.users[0].phoneNumbers[0].country,
        parent: callback.calls.argsFor(4)[0]
      });
    });

    // Checks that keys that do not match a table alias are ignored.
    it('checks that keys that do not match a table alias are ignored.', function()
    {
      var model =
      {
        users:
        [
          {name: 'joe',  age: 30},
          {
            name: 'phil',
            age: 14,
            phoneNumbers:
            [
              {phoneNumber: '111-111-1111'},
              {phoneNumber: '222-222-2222'}
            ]
          }
        ],
        foo: {bar: 'baz'}
      };

      traverse.breadthFirst(model, callback, db);

      expect(callback.calls.count()).toBe(4);
      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[1].phoneNumbers[0],
        parent: callback.calls.argsFor(1)[0]
      });

      expect(callback.calls.argsFor(3)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.users[1].phoneNumbers[1],
        parent: callback.calls.argsFor(1)[0]
      });
    });

    // Checks that the parent is always a valid table alias.
    it('checks that the parent is always a valid table alias.', function()
    {
      var model =
      {
        foo:
        {
          users:
          [
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

      expect(callback.calls.argsFor(0)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.foo.users[0],
        parent: null
      });

      expect(callback.calls.argsFor(1)[0]).toEqual
      ({
        tableAlias: 'users',
        model: model.foo.users[1],
        parent: null
      });

      expect(callback.calls.argsFor(2)[0]).toEqual
      ({
        tableAlias: 'phoneNumbers',
        model: model.foo.users[1].phoneNumbers,
        parent: callback.calls.argsFor(1)[0]
      });
    });
  });
});

