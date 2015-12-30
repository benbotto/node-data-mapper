describe('modelTraverse test suite.', function()
{
  'use strict';

  var traverse = require('./modelTraverse');
  var callback;

  beforeEach(function()
  {
    callback = jasmine.createSpy('callback');
  });

  describe('traverse depthFirst test suite.', function()
  {
    // Traverses a basic object.
    it('traverses a basic object.', function()
    {
      var callback  = jasmine.createSpy('callback');
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
      expect(callback.calls.argsFor(0)).toEqual(['users', obj.users]);
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
      expect(callback.calls.argsFor(0)).toEqual(['country', model.users.phoneNumbers[0].country]);
      expect(callback.calls.argsFor(1)).toEqual(['phoneNumbers', model.users.phoneNumbers[0]]);
      expect(callback.calls.argsFor(2)).toEqual(['phoneNumbers', model.users.phoneNumbers[1]]);
      expect(callback.calls.argsFor(3)).toEqual(['users', model.users]);
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
      expect(callback.calls.argsFor(0)).toEqual(['country', model.users[0].phoneNumbers[0].country]);
      expect(callback.calls.argsFor(1)).toEqual(['phoneNumbers', model.users[0].phoneNumbers[0]]);
      expect(callback.calls.argsFor(2)).toEqual(['phoneNumbers', model.users[0].phoneNumbers[1]]);
      expect(callback.calls.argsFor(3)).toEqual(['users', model.users[0]]);
      expect(callback.calls.argsFor(4)).toEqual(['phoneNumbers', model.users[1].phoneNumbers[0]]);
      expect(callback.calls.argsFor(5)).toEqual(['users', model.users[1]]);
      expect(callback.calls.argsFor(6)).toEqual(['products', model.products[0]]);
      expect(callback.calls.argsFor(7)).toEqual(['products', model.products[1]]);
    });
  });

  describe('traverse breadthFirst test suite.', function()
  {
    // Traverses a basic object.
    it('traverses a basic object.', function()
    {
      var callback  = jasmine.createSpy('callback');
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
      expect(callback.calls.argsFor(0)).toEqual(['users', obj.users]);
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
      expect(callback.calls.argsFor(0)).toEqual(['users', model.users]);
      expect(callback.calls.argsFor(1)).toEqual(['phoneNumbers', model.users.phoneNumbers[0]]);
      expect(callback.calls.argsFor(2)).toEqual(['phoneNumbers', model.users.phoneNumbers[1]]);
      expect(callback.calls.argsFor(3)).toEqual(['country', model.users.phoneNumbers[0].country]);
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

      traverse.breadthFirst(model, callback);
      expect(callback.calls.count()).toBe(8);
      expect(callback.calls.argsFor(0)).toEqual(['users', model.users[0]]);
      expect(callback.calls.argsFor(1)).toEqual(['users', model.users[1]]);
      expect(callback.calls.argsFor(2)).toEqual(['products', model.products[0]]);
      expect(callback.calls.argsFor(3)).toEqual(['products', model.products[1]]);
      expect(callback.calls.argsFor(4)).toEqual(['phoneNumbers', model.users[0].phoneNumbers[0]]);
      expect(callback.calls.argsFor(5)).toEqual(['phoneNumbers', model.users[0].phoneNumbers[1]]);
      expect(callback.calls.argsFor(6)).toEqual(['phoneNumbers', model.users[1].phoneNumbers[0]]);
      expect(callback.calls.argsFor(7)).toEqual(['country', model.users[0].phoneNumbers[0].country]);
    });
  });
});

