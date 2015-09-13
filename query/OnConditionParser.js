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

// <pair> ::= "{" <pair-comparison> | <condition-list> "}"
OnConditionParser.prototype._pair = function()
{
  var pairParts = ['comparison-operator', 'boolean-operator'];

  this._charTerminal('{');
  assert(this._tokenIn(pairParts), this._errorString('[' + pairParts.join(' | ') + ']'));

  if (this._token.type === 'comparison-operator')
    this._pairComparison();
  else
    this._conditionList();

  this._charTerminal('}');
};

// <pair-comparison> ::= $eq ":" "{" <string> ":" <string> "}"
OnConditionParser.prototype._pairComparison = function()
{
  this._matchValue('$eq');
  this._charTerminal(':');
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._string();
  this._charTerminal('}');
};

// <condition-list> ::= $and ":" "[" "{" <pair-comparison> "}" {"," "{" <pair-comparison> "}"} "]"
OnConditionParser.prototype._conditionList = function()
{
  this._matchValue('$and');
  this._charTerminal(':');
  this._charTerminal('[');
  this._charTerminal('{');
  this._pairComparison();
  this._charTerminal('}');
  // <boolean-operator> is preceded by an array of <pair-comparison>.  After
  // adding each <pair-comparison> node make the <boolean-operator> the current
  // node.
  this._curNode = this._curNode.parent;
  while (this._token.value === ',')
  {
    this._charTerminal(',');
    this._charTerminal('{');
    this._pairComparison();
    this._charTerminal('}');
    this._curNode = this._curNode.parent;
  }
  this._charTerminal(']');
};

module.exports = OnConditionParser;

