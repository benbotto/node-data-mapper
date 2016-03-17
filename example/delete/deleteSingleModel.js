'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Delete a single model by ID.
var query = bikeShopDC.delete
({
  // The key is a table alias, and the value can be
  // an object or an array.
  bonuses:
  {
    // The primary key is required when deleting a model.
    bonusID: 1
  }
});

console.log('Query:');
console.log(query.toString(), '\n');

// A promise is returned, and the result has an 'affectedRows' property.
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
