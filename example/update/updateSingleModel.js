'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Updatea single model by ID.
var query = bikeShopDC.update
({
  // The key is a table alias, and the value is an object containing key-value
  // pairs corresponding to column aliases.
  bonuses:
  {
    // The primary key is required when deleting a model.
    bonusID: 3,
    amount: 600,
    reason: 'Super outstanding technical skills.'
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
