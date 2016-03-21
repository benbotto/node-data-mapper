'use strict';

var bikeShopDC = require('../bikeShopDataContext');

var query = bikeShopDC.update
({
  bonuses:
  [
    {
      bonusID: 1,
      amount:  300,
      reason:  'Best salesperson ever.'
    },
    {
      bonusID: 2,
      amount: 400
    }
  ],
  staff:
  {
    staffID:   1,
    firstName: 'Rand'
  },
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
