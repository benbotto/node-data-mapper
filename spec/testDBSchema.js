'use strict';

require('insulin').factory('ndm_testDBSchema', ['ndm_bitConverter'],
  ndm_testDBSchemaProducer);

function ndm_testDBSchemaProducer(bitConverter ) {
  return {
    name: 'testDB',
    tables: [
      {
        name: 'users',
        columns: [
          {
            name: 'userID',
            mapTo: 'ID',
            isPrimary: true
          },
          {
            name: 'firstName',
            mapTo: 'first'
          },
          {
            name: 'lastName',
            mapTo: 'last'
          }
        ]
      },
      {
        name: 'phone_numbers',
        mapTo: 'phoneNumbers',
        columns: [
          {
            name: 'phoneNumberID',
            mapTo: 'ID',
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
        columns: [
          {name: 'productID', isPrimary: true},
          {name: 'description'},
          {name: 'isActive', converter: bitConverter}
        ]
      }
    ]
  };
}

