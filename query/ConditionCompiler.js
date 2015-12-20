'use strict';

var assert = require('../util/assert');

/**
 * This class takes in a parse tree--as created by a ConditionParser--and
 * compiles the condition into SQL.
 * @param escaper An instance of an Escaper that matches the database type
 *        (i.e. MySQLEscaper or MSSQLEscaper).
 */
function ConditionCompiler(escaper)
{
  this._escaper = escaper;
}

/**
 * Compile the parse tree.
 * @param parseTree The parse tree, as created by a ConditionParser.
 * @param params An object of key-value pairs that are used to replace
 *        values in the query.
 */
ConditionCompiler.prototype.compile = function(parseTree, params)
{
  var compOps =
  {
    $eq:      '=',
    $neq:     '<>',
    $lt:      '<',
    $lte:     '<=',
    $gt:      '>',
    $gte:     '>=',
    $like:    'LIKE',
    $notLike: 'NOT LIKE'
  };

  var nullOps =
  {
    $is:   'IS',
    $isnt: 'IS NOT'
  };

  var boolOps =
  {
    $and: 'AND',
    $or:  'OR'
  };

  params = params || {};

  // Function to recursively traverse the parse tree and compile it.
  function traverse(tree, escaper)
  {
    var sql, i, kids, column, op, value;

    // Helper to return a <value>, which may be a parameter, column, or number.
    // The return is escaped properly.
    function getValue(token, escaper)
    {
      // The token could be a column, a parameter, or a number.
      if (token.type === 'column')
        return escaper.escapeFullyQualifiedColumn(token.value);
      else if (token.type === 'parameter')
      {
        // Find the value in the params list (the leading colon is removed).
        var value = params[token.value.substring(1)];
        assert(value, 'Replacement value for parameter ' + token.value + ' not present.');
        return escaper.escapeLiteral(value);
      }
      else
        return token.value;
    }

    switch (tree.token.type)
    {
      case 'comparison-operator':
        // <column> <comparison-operator> <value> (ex. `users`.`name` = :name)
        // where value is a parameter, column, or number.
        column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value);
        op     = compOps[tree.token.value];
        value  = getValue(tree.children[1].token, escaper);

        return column + ' ' + op + ' ' + value;

      case 'null-comparison-operator':
        // <column> <null-operator> NULL (ex. `j`.`occupation` IS NULL).
        return escaper.escapeFullyQualifiedColumn(tree.children[0].token.value) + ' ' +
          nullOps[tree.token.value] + ' NULL';

      case 'in-comparison-operator':
        // <column> IN (<value> {, <value}) (ex. `shoeSize` IN (10, 10.5, 11)).
        kids = [];

        // <column> IN.
        sql = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value) + ' IN ';

        // All the values.
        for (i = 1; i < tree.children.length; ++i)
          kids.push(getValue(tree.children[i].token, escaper));

        // Explode the values with a comma, and wrap them in parens.
        sql += '(' + kids.join(', ') + ')';
        return sql;

      case 'boolean-operator':
        // Each of the children is a <condition>.  Put each <condition> in an array.
        kids = tree.children.map(function(child)
        {
          return traverse(child, escaper);
        });

        // Explode the conditions on the current boolean operator (AND or OR).
        // Boolean conditions must be wrapped in parens for precedence purposes.
        return '(' + kids.join(' ' + boolOps[tree.token.value] + ' ') + ')';

      default:
        // The only way this can fire is if the input parse tree did not come
        // from the ConditionParser.  Trees from the ConditionParser are
        // guaranteed to be syntactically correct.
        throw new Error('Unknown type: ' + tree.token.type);
    }
  }
  
  return traverse(parseTree, this._escaper);
};

/**
 * Get all the columns referenced in the parse tree and return them as an array.
 * @param parseTree The parse tree, as created by a ConditionParser.
 */
ConditionCompiler.prototype.getColumns = function(parseTree)
{
  var columns = [];

  // Recursively traverse tree.
  (function traverse(tree, columns)
  {
    // If the current node is a column and not yet in the list of columns, add it.
    if (tree.token.type === 'column' && columns.indexOf(tree.token.value) === -1)
      columns.push(tree.token.value);

    // Recurse into all children.
    for (var i = 0; i < tree.children.length; ++i)
      traverse(tree.children[i], columns);
  })(parseTree, columns);

  return columns;
};

module.exports = ConditionCompiler;

