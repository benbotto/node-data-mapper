'use strict';

var assert          = require(__dirname + '/../assert');
var ConditionParser = require(__dirname + '/ConditionParser');

/**
 * This class is a recursive decent parser for a ON Condition, which is a
 * representation of a SQL ON condition.  This parser takes in a condition
 * object and makes sure that it is a valid condition.  If the condition
 * sentence does not match the condition grammer an exception is raised.
 * Otherwise a parse tree is created.
 */
function OnConditionParser() {}

// Extends ConditionParser.
OnConditionParser.prototype = Object.create(ConditionParser.prototype);
OnConditionParser.prototype.constructor = OnConditionParser;

// Entry point.  The entire condition sentence.  BNF follows.
// <condition>           ::= "{" <comparison> | <logical-condition> "}"
// <comparison>          ::= <comparison-operator> ":" "{" <string> ":" <string> "}"
// <logical-condition>   ::= <boolean-operator> ":" "[" <condition> {"," <condition>} "]"
// <comparison-operator> ::= "$eq" | "$neq" | "$lt" | "$lte" | "$gt" | "$gte"
// <boolean-operator>    ::= "$and" | "$or"
OnConditionParser.prototype._condition = function()
{
  var pairParts = ['comparison-operator', 'boolean-operator'];

  this._charTerminal('{');
  assert(this._tokenIn(pairParts), this._errorString('[' + pairParts.join(' | ') + ']'));

  if (this._token.type === 'comparison-operator')
    this._comparison();
  else
    this._logicalCondition();

  this._charTerminal('}');
};

// <comparison> ::= <comparison-operator> ":" "{" <string> ":" <string> "}"
OnConditionParser.prototype._comparison = function()
{
  this._comparisonOperator();
  this._charTerminal(':');
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._string();
  this._charTerminal('}');
};

module.exports = OnConditionParser;

