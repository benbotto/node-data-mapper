'use strict';

var util       = require('util');
var deferred   = require('deferred');
var bikeShopDC = require('../bikeShopDataContext');
var ndm        = require('node-data-mapper');

var model =
{
  bikeShops:
  {
    name:    'Bikes and Such',
    address: '8795 Folsom Blvd.',
    staff:
    [
      {
        firstName:    'Alicia',
        lastName:     'Montoya',
        gender:       'female',
        hasStoreKeys: true,
        hireDate:     new Date(2016, 3, 19)
      }
    ]
  }
};

// Recursively traverse over the model, depth-first.
var queries = [];
ndm.modelTraverse.breadthFirst(model, function(meta)
{
  var insModel = {};

  // The model to be inserted must have a table alias for a key.
  insModel[meta.tableAlias] = meta.model;

  // Queue the insert query.
  queries.push(bikeShopDC.insert(insModel));
}, bikeShopDC.getDatabase());

var defer   = deferred();
var results = [];

// Process the queue of insert queries.
doInsert();
function doInsert()
{
  // No queries left in the queue.  Resolve the promise.
  if (queries.length === 0)
  {
    defer.resolve(results);
    return;
  }

  // Get the query at the top of the queue and execute it.
  var query = queries.shift();

  console.log('Query:');
  console.log(query.toString(), '\n');
  
  query.execute()
    .then(handleResult)
    .catch(handleError);

  // On success, store the result and process the next query.
  function handleResult(result)
  {
    results.push(result);
    doInsert();
  }

  // Reject the promise on failure.
  function handleError(err)
  {
    defer.reject(err);
  }
}

defer.promise
  .then(function(result)
  {
    console.log('Result:');
    console.log(util.inspect(result, {depth: null}));
  })
  .catch(function(err)
  {
    console.log('Error:');
    console.log(err);
  })
  .finally(function()
  {
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });

