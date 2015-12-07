var MySQLDataContext = require(__dirname + '/../datacontext/MySQLDataContext');
var Database         = require(__dirname + '/../database/Database');
var mysql            = require('mysql');
var db               = new Database(require(__dirname + '/bikeShop'));
var pool             = mysql.createPool
({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.getName(),
  connectionLimit: 10
});

module.exports = new MySQLDataContext(db, pool);

