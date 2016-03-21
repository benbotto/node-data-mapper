'use strict';

var bikeShopDC = require('../bikeShopDataContext');

var query = bikeShopDC.delete
({
  bonuses: { bonusID: 3},
  staff:
  [
    {staffID: 1},
    {staffID: 3}
  ]
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
