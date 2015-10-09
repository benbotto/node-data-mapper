'use strict';

/**
 * Helper class for escaping parts of a query.
 */
function Escaper()
{
}

/**
 * Escape a property, such as a table, column name, or alias.
 * @param prop The property to escape.
 */
Escaper.prototype.escapeProperty = function(/*prop*/)
{
  throw new Error('Function escapeProperty() is not implemented.');
};

/**
 * Escape a literal, such as a string or a number.
 * @param literal The literal to escape, which is escaped based on its type.
 */
Escaper.prototype.escapeLiteral = function(/*literal*/)
{
  throw new Error('Function escapeLiteral() is not implemented.');
};

/**
 * Escape a fully-qualified column name, such as 'u.firstName' or
 * 'phone_numbers.phoneNumber'.
 * @param fqc The fully-qualified column.
 */
Escaper.prototype.escapeFullyQualifiedColumn = function(fqc)
{
  var firstDot = fqc.indexOf('.');
  var tbl, col;
  
  // There is no dot, it's just a column name.
  if (firstDot === -1)
    return this.escapeProperty(fqc);

  // Get the table and column parts and escape each individually.
  tbl = fqc.substring(0, firstDot);
  col = fqc.substring(firstDot + 1);

  return this.escapeProperty(tbl) + '.' + this.escapeProperty(col);
};

module.exports = Escaper;

