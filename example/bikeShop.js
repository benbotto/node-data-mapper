'use strict';

var ndm = require('node-data-mapper');
var db  =
{
  name: 'bike_shop',
  tables:
  [
    {
      // The name of the database table.
      name: 'bike_shops',
      // When a query is mapped to an object or array, by default the object
      // will use the alias.  In this case, selecting from bike_shops will
      // result in an array of bikeShops.
      alias: 'bikeShops',
      columns:
      [
        // Each table must have a primary key.  Support for composite keys is
        // underway.
        {name: 'bikeShopID', isPrimary: true},
        {name: 'name'},
        {name: 'address'}
      ]
    },
    {
      name: 'staff',
      columns:
      [
        {name: 'staffID', isPrimary: true},
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'age'},
        // Columns can also be aliased.  Here, the column "sex" will be 
        // serialized as "gender."
        {name: 'sex', alias: 'gender'},
        // Converter objects can be added to Column definitions.  A converter
        // has an onRetrieve and an onSave function.  The former takes a value
        // from the database and converts it for serialization.  The latter
        // takes a serialized value and converts it such that it can be saved
        // to the database.  In this case bit values from the database will
        // be turned into booleans.
        {name: 'hasStoreKeys', converter: ndm.bitConverter},
        {name: 'hireDate'},
        {name: 'bikeShopID'}
      ]
    },
    {
      name: 'bonuses',
      columns:
      [
        {name: 'bonusID', isPrimary: true},
        {name: 'reason'},
        {name: 'amount'},
        {name: 'dateGiven'},
        {name: 'staffID'}
      ]
    },
    {
      name: 'bikes',
      columns:
      [
        {name: 'bikeID', isPrimary: true},
        {name: 'brand'},
        {name: 'model'},
        {name: 'msrp'}
      ]
    },
    {
      name: 'bike_shop_bikes',
      alias: 'bikeShopBikes',
      columns:
      [
        {name: 'bikeShopBikeID', isPrimary: true},
        {name: 'bikeShopID'},
        {name: 'bikeID'}
      ]
    }
  ]
};

module.exports = db;

