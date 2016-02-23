'use strict';

var mysql = require('mysql');

var connection = mysql.createConnection
({
  host:      'localhost',
  user:      'example',
  password:  'secret',
  database : 'bike_shop'
});

var query =
  'INSERT INTO `bike_shops` (`name`, `address`)\n' +
  "VALUES ('Joe\\'s Bike Shack', '1224 Tata Ln.')";

connection.connect();

connection.query(query, function(err, result)
{
  connection.end();
  if (err)
  {
    console.log('Error');
    console.log(err);
  }
  console.dir(result);
  console.log(result.insertId);
});
