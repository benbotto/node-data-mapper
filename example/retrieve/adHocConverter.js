'use strict';

const booleanConverter = require('node-data-mapper').booleanConverter;
const MySQLDriver      = require('node-data-mapper-mysql').MySQLDriver;
const driver           = new MySQLDriver(require('../bikeShopConOpts.json'));

driver
  .initialize()
  .then(runQuery)
  .then(printResult)
  .catch(console.error)
  .finally(() => driver.end());

function runQuery(dataContext) {
  const query = dataContext
    .from('staff s')
    .select(
      's.staffID',
      // Convert "hasStoreKeys" to boolean.
      {column: 's.hasStoreKeys', convert: booleanConverter.onRetrieve},
      // Convert "firstName" to upper case.
      {column: 's.firstName',    convert: fName => fName.toUpperCase()}
    );

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

