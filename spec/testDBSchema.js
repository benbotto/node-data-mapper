'use strict';

require('insulin').factory('ndm_testDBSchema', ['ndm_bitConverter'],
  ndm_testDBSchemaProducer);

function ndm_testDBSchemaProducer(bitConverter) {
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
        ],
        foreignKeys: [
          {
            column: 'userID',
            name:   'fk_userID_users_userID',
            references: {
              table: 'users',
              column: 'userID'
            }
          }
        ]
      },
      {
        name: 'products',
        columns: [
          {
            name: 'productID',
            isPrimary: true
          },
          {
            name: 'description'
          },
          {
            name: 'isActive',
            converter: bitConverter
          },
          {
            name: 'photoID'
          }
        ],
        foreignKeys: [
          {
            column: 'photoID',
            name: 'fk_photoID_photos_photoID',
            references: {
              table: 'photos',
              column: 'photoID'
            }
          }
        ]
      },
      {
        name: 'photos',
        columns: [
          {
            name: 'photoID',
            isPrimary: true
          },
          {
            name: 'photoURL'
          },
          {
            name: 'largeThumbnailID'
          },
          {
            name: 'smallThumbnailID'
          },
        ],
        foreignKeys: [
          {
            column: 'largeThumbnailID',
            name: 'fk_largeThumbnailID_photos_photoID',
            references: {
              table: 'photos',
              column: 'photoID'
            }
          },
          {
            column: 'smallThumbnailID',
            name: 'fk_smallThumbnailID_photos_photoID',
            references: {
              table: 'photos',
              column: 'photoID'
            }
          }
        ]
      }
    ]
  };
}

