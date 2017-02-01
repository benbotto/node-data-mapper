'use strict';

const MySQLDriver = require('node-data-mapper-mysql').MySQLDriver;
const driver      = new MySQLDriver(require('../bikeShopConOpts.json'));

driver
  .initialize()
  .then(dumpSchema)
  .catch(console.error)
  .finally(() => driver.end());

function dumpSchema(dataContext) {
  console.log('Schema:');
  console.log(JSON.stringify(dataContext.database, null, 2));
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

