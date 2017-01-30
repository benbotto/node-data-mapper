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
  // Give keys to anyone over 21 that has received a bonus.
  const query = dataContext
    .from('staff s')
    .innerJoin('s.bonuses b')
    .where(
      {$gt: {'s.age': ':minAge'}},
      {minAge: 21}
    )
    .update({'s.hasStoreKeys': true});

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

