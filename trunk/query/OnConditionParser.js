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

// A clause (the full sentence/program) is a condition.  After the condition
// the token should be null.
OnConditionParser.prototype._clause = function()
{
  this._condition();
  assert(this._token === null, this._errorString('EOL'));
};

// <condition> ::= <pair-comparison> | <condition-list>
OnConditionParser.prototype._condition = function()
{
  assert(this._token.value === '{' || this._token.value === '[',
    this._errorString('[ <pair-comparison> | <condition-list> ]'));

  if (this._token.value === '{')
    this._pairComparison();
  else
    this._conditionList();
};

// <pair-comparison> ::= "{" <string> ":" <string> "}"
OnConditionParser.prototype._pairComparison = function()
{
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._string();
  this._charTerminal('}');
};

// <condition-list> ::= "[" <pair-comparison> {"," <pair-comparison>} "]"
OnConditionParser.prototype._conditionList = function()
{
  this._charTerminal('[');
  this._pairComparison();
  while (this._token && this._token.value === ',')
  {
    this._charTerminal(',');
    this._pairComparison();
  }
  this._charTerminal(']');
};

// Helper function to add a node to the parse tree.
OnConditionParser.prototype._addNode = function()
{
  // The "tree" is just a flat array for ON conditions.
  if (this._tree === null)
    this._tree = [];
  this._tree.push(this._token);
};

module.exports = OnConditionParser;

