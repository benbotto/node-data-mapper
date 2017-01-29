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
    .from('staff s')
    .leftOuterJoin('s.bonuses b')
    .where(
      // Staff members that have never received a bonus and are over the age
      // of 65 are getting fired today.
      {
        $and: [
          {$is: {'b.bonusID': null}},
          {$gt: {'s.age': ':overTheHill'}}
        ]
      },
      {overTheHill: 65}
    )
    .delete();

  console.log('Query:');
  console.log(query.toString(), '\n');

  return query
    .execute();
}

function printResult(result) {
  console.log('Result:');
  console.log(result);
}

