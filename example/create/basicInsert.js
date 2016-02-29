'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Create a new bike shop.
var query = bikeShopDC.insert
({
  // This is the alias of the table, not the table name.
  bikeShops:
  {
    name:    "Phil Billy's Bikes",
    address: '432 Red Rider Rd.'
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

// Just like the selections, insertions return a promise.  The inserted model
// is returned.
query.execute().then(function(result)
{
  // Notice that the new identifier is populated if the table has an
  // auto-incrementing primary key.
  console.log('Result:');
  console.log(result);
})
.catch(function(err)
{
  console.log(err);
}).finally(function()
{
  bikeShopDC.getQueryExecuter().getConnectionPool().end();
});
