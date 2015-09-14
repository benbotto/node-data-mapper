'use strict';

var escaper = require(__dirname + '/escaper');

/**
 * This class takes in a parse tree--as created by an OnConditionParser--and
 * compiles the condition into SQL.
 */
function OnConditionCompiler() {}

/**
 * Compile the parse tree which, in this case, is a flat array.
 * @param parseTree The parse tree, as created by an OnConditionParser.
 */
OnConditionCompiler.prototype.compile = function(parseTree)
{
  var conds = [];
  var lCol;
  var rCol;

  for (var i = 0; i < parseTree.length; i += 2)
  {
    lCol = escaper.escapeProperty(parseTree[i].value);
    rCol = escaper.escapeProperty(parseTree[i + 1].value);
    conds.push(lCol + ' = ' + rCol);
  }

  return conds.join(' AND ');
};

/**
 * Get all the columns referenced in the parse tree and return them as an array.
 * @param parseTree The parse tree, as created by a ConditionParser.
 */
OnConditionCompiler.prototype.getColumns = function(parseTree)
{
  var columns = [];

  for (var i = 0; i < parseTree.length; ++i)
  {
    if (columns.indexOf(parseTree[i].value) === -1)
      columns.push(parseTree[i].value);
  }

  return columns;
};

module.exports = OnConditionCompiler;

