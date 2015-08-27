'use strict';

var assert = require(__dirname + '/../assert');

/**
 * Helper class for escaping parts of a query.
 */
function Escaper()
{
  this.DB_TYPE = {MYSQL: 0, MSSQL: 1};
  this.setDBType(this.DB_TYPE.MYSQL);
}

/**
 * Get the database type.
 */
Escaper.prototype.getDBType = function()
{
  return this._dbType;
};

/**
 * Set the database type.
 * @param dbType The DB_TYPE (MYSQL OR MSSQL).  Defaults to MYSQL.
 */
Escaper.prototype.setDBType = function(dbType)
{
  assert(dbType >= 0 && dbType <= 1, 'Invalid database type.');
  this._dbType = dbType;
};

/**
 * Escape a property, such as a table, column name, or alias.
 * @param prop The property to escape.
 */
Escaper.prototype.escapeProperty = function(prop)
{
  if (this._dbType === this.DB_TYPE.MYSQL)
    return '`' + prop + '`';
  else
    return '[' + prop + ']';
};

/**
 * Escape a literal, such as a string or a number.
 * @param literal The literal to escape, which is escaped based on its type.
 */
Escaper.prototype.escapeLiteral = function(literal)
{
  var type = typeof(literal);

  switch (type)
  {
    case 'number':
      return literal;

    // Treat it like a string.
    default:
      return '\'' + literal.replace(/'/g, '\'\'') + '\'';
  }
};

// Single instance.
module.exports = new Escaper();

