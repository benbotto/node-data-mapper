'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));

// 1) Initialize node-data-mapper.
// 2) Retrieve all the records from the bike_shops table.
// 3) Print the results on the console.
// 4) Close the DB connection.
driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  // Select all columns from the bike_shops table.
  const query = dataContext
    .from('bike_shops')
    .select();

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

