var DataContext        = require(__dirname + '/../DataContext');
var Database           = require(__dirname + '/../Database');
var MySQLEscaper       = require(__dirname + '/../query/MySQLEscaper');
var MySQLQueryExecuter = require(__dirname + '/../query/MySQLQueryExecuter');
var mysql              = require('mysql');

var escaper = new MySQLEscaper();
var db      = new Database(require(__dirname + '/testDB.json'));
var pool    = mysql.createPool
({
  host:            'localhost',
  user:            'testUser',
  password:        '4me2n0',
  database:        'test',
  connectionLimit: 10
});
var queryExec = new MySQLQueryExecuter(pool);
var testDC    = new DataContext(db, escaper, queryExec);

module.exports = testDC;

