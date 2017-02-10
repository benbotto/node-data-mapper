'use strict';

require('insulin').factory('ndm_testDB',
  ['ndm_testDBSchema', 'ndm_Database'],
  ndm_testDBProducer);

function ndm_testDBProducer(schema, Database) {
  return new Database(schema);
}

