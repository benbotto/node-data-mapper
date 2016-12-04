'use strict';

require('../bootstrap');
require('./testDBSchema');
require('./testDB');

// MySQL-specific code is used when testing (QueryExecuter and Escaper).
require('node-data-mapper-mysql');

