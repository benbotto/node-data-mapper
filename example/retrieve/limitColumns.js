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
  const query = dataContext
    // The table is aliased "bs" for convenience.
    .from('bike_shops bs')
    // Select only the ID and name of the shop.
    .select('bs.bikeShopID', 'bs.name');

  // This is the query that will be executed.
  console.log('Query:');
  console.log(query.toString(), '\n');

  // Executing a query returns a promise.
  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

