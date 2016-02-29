'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Create a new bike shop.
var query = bikeShopDC.insert
({
  bikeShops:
  {
    name:    "Phil Billy's Bikes",
    address: '432 Red Rider Rd.'
  }
});

// This is the query that will be executed.
console.log('Query:');
console.log(query.toString(), '\n');

// Executing a query returns a promise, as defined by the deferred API.
// https://www.npmjs.com/package/deferred
query.execute().then(function(result)
{
  // Notice that the new ID is populated.
  console.log('Result:');
  console.log(result);
})
.catch(function(err)
{
  console.log(err);
}).finally(function()
{
  // Close the connection.
  bikeShopDC.getQueryExecuter().getConnectionPool().end();
});
