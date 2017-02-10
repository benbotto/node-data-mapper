'use strict';

// MySQL-specific code is used when testing (QueryExecuter and Escaper).
// This has to be included before bootstrap or else the ndm_ namespace
// will get overwritten.
require('node-data-mapper-mysql');

require('../bootstrap');
require('./testDBSchema');
require('./testDB');

