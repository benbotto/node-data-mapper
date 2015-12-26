'use strict';

var bitConverter = require('../converter/bitConverter');

var db =
{
  name: 'testDB',
  tables:
  [
    {
      name: 'users',
      columns:
      [
        {
          name: 'userID',
          alias: 'ID',
          isPrimary: true
        },
        {
          name: 'firstName',
          alias: 'first'
        },
        {
          name: 'lastName',
          alias: 'last'
        }
      ]
    },
    {
      name: 'phone_numbers',
      alias: 'phoneNumbers',
      columns:
      [
        {
          name: 'phoneNumberID',
          alias: 'ID',
          isPrimary: true
        },
        {
          name: 'userID'
        },
        {
          name: 'phoneNumber'
        },
        {
          name: 'type'
        }
      ]
    },
    {
      name: 'products',
      columns:
      [
        {name: 'productID', isPrimary: true},
        {name: 'description'},
        {name: 'isActive', converter: bitConverter}
      ]
    }
  ]
};

module.exports = db;

