'use strict';

var mysql = require('mysql');

var connection = mysql.createConnection
({
  host:      'localhost',
  user:      'example',
  password:  'secret',
  database : 'bike_shop'
});

var query = 'UPDATE staff SET age = 78 WHERE staffID = 1';

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
