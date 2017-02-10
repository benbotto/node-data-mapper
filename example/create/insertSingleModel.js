'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Insert a single bike_shops record.
  const query = dataContext
    .insert({
      bike_shops: {
        name:    "Phil Billy's Bikes",
        address: '432 Red Rider Rd.'
      }
    });

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  // Note that the ID is set on the model (e.g. result.bike_shops.bikeShopID).
  console.log('Result:');
  console.log(result);
}

