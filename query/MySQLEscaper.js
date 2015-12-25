'use strict';

var mysql   = require('mysql');
var Escaper = require('./Escaper');

/**
 * Helper class for escaping parts of a query.
 */
function MySQLEscaper()
{
  Escaper.call(this);
}

MySQLEscaper.prototype = Object.create(Escaper.prototype);
MySQLEscaper.prototype.constructor = Escaper;

/**
 * Escape a property, such as a table, column name, or alias.
 * @param prop The property to escape.
 */
MySQLEscaper.prototype.escapeProperty = function(prop)
{
  return '`' + prop + '`';
};

/**
 * Escape a literal, such as a string or a number.
 * @param literal The literal to escape, which is escaped based on its type.
 */
MySQLEscaper.prototype.escapeLiteral = function(literal)
{
  return mysql.escape(literal);
};

module.exports = MySQLEscaper;

