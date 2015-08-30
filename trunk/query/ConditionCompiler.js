'use strict';

var escaper = require(__dirname + '/escaper');

/**
 * This class takes in a parse tree--as created by a ConditionParser--and
 * compiles the condition into SQL.
 */
function ConditionCompiler() {}

/**
 * Compile the parse tree.
 * @param parseTree The parse tree, as created by a ConditionParser.
 */
ConditionCompiler.prototype.compile = function(parseTree)
{
  var compOps =
  {
    $eq:  '=',
    $neq: '<>',
    $lt:  '<',
    $lte: '<=',
    $gt:  '>',
    $gte: '>='
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

  // Function to recursively traverse the parse tree and compile it.
  function traverse(tree)
  {
    var sql, i, kids;

    switch (tree.token.type)
    {
      case 'comparison-operator':
        // <column> <comparison-operator> <property> (ex. `name` = 'Joe').
        return escaper.escapeProperty(tree.children[0].token.value) + ' ' +
          compOps[tree.token.value] + ' ' +
          escaper.escapeLiteral(tree.children[1].token.value);

      case 'null-comparison-operator':
        // <column> <null-operator> NULL (ex. `occupation` IS NULL).
        return escaper.escapeProperty(tree.children[0].token.value) + ' ' +
          nullOps[tree.token.value] + ' NULL';

      case 'in-comparison-operator':
        // <column> IN (<value> {, <value}) (ex. `shoeSize` IN (10, 10.5, 11)).
        kids = [];

        // <column> IN.
        sql = escaper.escapeProperty(tree.children[0].token.value) + ' IN ';

        // All the values.
        for (i = 1; i < tree.children.length; ++i)
          kids.push(escaper.escapeLiteral(tree.children[i].token.value));

        // Explode the values with a comma, and wrap them in parens.
        sql += '(' + kids.join(', ') + ')';
        return sql;

      case 'boolean-operator':
        // Each of the children is a <pair>.  Put each <pair> in an array.
        kids = tree.children.map(function(child)
        {
          return traverse(child);
        });

        // Explode the conditions on the current boolean operator (AND or OR).
        // Boolean conditions must be wrapped in parens for precedence purposes.
        return '(' + kids.join(' ' + boolOps[tree.token.value] + ' ') + ')';

      default:
        // The only way this can fire is if the input parse tree did not come
        // from the ConditoinParser.  Trees from the ConditionParser are
        // guaranteed to be syntactically correct.
        throw new Error('Unknown type: ' + tree.token.type);
    }
  }
  
  return traverse(parseTree);
};

module.exports = ConditionCompiler;

