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
    // Map the "bike_shops" table to a property named "shops."
    .from({table: 'bike_shops', as: 'bs', mapTo: 'shops'})

    // "bikeShopID" will map to a property named "id," and "name" will map to
    // "shopName."
    .select(
      {column: 'bs.bikeShopID', mapTo: 'id'},
      {column: 'bs.name',       mapTo: 'shopName'}
    );

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

