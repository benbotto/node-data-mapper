'use strict';

var util       = require('util');
var bikeShopDC = require('../bikeShopDataContext');

var query = bikeShopDC.insert
({
  bikeShops:
  {
    name:    'Redwood Bikes',
    address: '2929 Alberton Blvd.',
    staff:
    [
      {
        firstName:    'Stan',
        lastName:     'Stark',
        gender:       'male',
        hasStoreKeys: false,
        hireDate:     new Date(2016, 2, 4)
      }
    ]
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

query.execute()
  .then(function(result)
  {
    // The bikeShopID is set on the staff member.
    console.log('Result:');
    console.log(util.inspect(result, {depth: null}));
  })
  .catch(function(err)
  {
    console.log(err);
  })
  .finally(function()
  {
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });
