'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Create two new bike shops and a new bike.
var query = bikeShopDC.insert
({
  bikeShops:
  [
    {
      name:    'Cycle City',
      address: '82 Bloom St.'
    },
    {
      name:    'Cadence and Clip',
      address: '7712 Ackworth Barn Dr.'
    }
  ],
  bikes:
  {
    brand: 'Gary Fisher',
    model: 'Remedy',
    msrp:  5499.99
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

query.execute()
  .then(function(result)
  {
    console.log('Result:');
    console.log(result);
  })
  .catch(function(err)
  {
    console.log(err);
  })
  .finally(function()
  {
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });
