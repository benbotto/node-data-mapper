'use strict';

var assert = require(__dirname + '/../assert');

/**
 * This class is a recursive decent parser for a WHERE Condition, which is a
 * representation of a SQL WHERE condition.  This parser takes in a condition
 * object and makes sure that it is a valid condition.  If the condition
 * sentence does not match the condition grammer an exception is raised.
 * Otherwise a parse tree is created.
 */
function ConditionParser() {}

/**
 * Parse the condition (as an object) and return a parse tree.
 * @param tokens An array of tokens, as created by a ConditionLexer.
 */
ConditionParser.prototype.parse = function(tokens)
{
  this._tokenInd = 0;
  this._tokens   = tokens;
  this._token    = this._tokens[this._tokenInd];
  this._tree     = null;
  this._curNode  = null;

  // Parse the program, and return the resulting parse tree.
  this._clause();
  return this._tree;
};

// A clause (the full sentence/program) is a pair.  After the pair the token
// should be null.
ConditionParser.prototype._clause = function()
{
  this._pair();
  assert(this._token === null, this._errorString('EOL'));
};

// <pair>            ::= "{" <pair-comparison> | <null-comparison> | <in-comparison> | <condition-list> "}"
// <pair-comparison> ::= <comparison-operator> ":" "{" <string> ":" <value> "}"
// <null-comparison> ::= <null-comparison-operator> ":" "{" <string> ":" null "}"
// <in-comparison>   ::= <in-comparison-operator> ":" "{" <string> ":" "[" <value> {"," <value>} "]" "}"
ConditionParser.prototype._pair = function()
{
  var pairParts = ['comparison-operator', 'null-comparison-operator', 'in-comparison-operator', 'boolean-operator'];

  this._charTerminal('{');
  assert(this._tokenIn(pairParts), this._errorString('[' + pairParts.join(' | ') + ']'));

  if (this._token.type === 'comparison-operator')
    this._pairComparison();
  else if (this._token.type === 'null-comparison-operator')
    this._nullComparison();
  else if (this._token.type === 'in-comparison-operator')
    this._inComparison();
  else
    this._conditionList();

  this._charTerminal('}');
};

// <pair-comparison> ::= <comparison-operator> ":" "{" <string> ":" <value> "}"
ConditionParser.prototype._pairComparison = function()
{
  this._comparisonOperator();
  this._charTerminal(':');
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._value();
  this._charTerminal('}');
};

// <in-comparison> ::= <in-comparison-operator> ":" "{" <string> ":" "[" <value> {"," <value>} "]" "}"
ConditionParser.prototype._inComparison = function()
{
  this._inComparisonOperator();
  this._charTerminal(':');
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._charTerminal('[');
  this._value();
  while (this._token.value === ',')
  {
    this._charTerminal(',');
    this._value();
  }
  this._charTerminal(']');
  this._charTerminal('}');
};

// <null-comparison> ::= <null-comparison-operator> ":" "{" <string> ":" null "}"
ConditionParser.prototype._nullComparison = function()
{
  this._nullComparisonOperator();
  this._charTerminal(':');
  this._charTerminal('{');
  this._string();
  this._charTerminal(':');
  this._nullTerminal();
  this._charTerminal('}');
};

// <condition-list> ::= <boolean-operator> ":" "[" <pair> {"," <pair>} "]"
ConditionParser.prototype._conditionList = function()
{
  this._booleanOperator();
  this._charTerminal(':');
  this._charTerminal('[');
  this._pair();
  // <boolean-operator> is preceded by an array of <pair>.  After adding each
  // <pair> node make the <boolean-operator> the current node.
  this._curNode = this._curNode.parent;
  while (this._token.value === ',')
  {
    this._charTerminal(',');
    this._pair();
    this._curNode = this._curNode.parent;
  }
  this._charTerminal(']');
};

// <comparison-operator> ::= "$eq" | "$neq" | "$lt" | "$lte" | "$gt" | "$gte"
ConditionParser.prototype._comparisonOperator = function()
{
  this._matchType('comparison-operator');
};

// <in-comparison-operator> ::= "$in"
ConditionParser.prototype._inComparisonOperator = function()
{
  this._matchType('in-comparison-operator');
};

// <null-comparison-operator> ::= "$is" | "$isnt"
ConditionParser.prototype._nullComparisonOperator = function()
{
  this._matchType('null-comparison-operator');
};

// <boolean-operator> ::= "$and" | "$or"
ConditionParser.prototype._booleanOperator = function()
{
  this._matchType('boolean-operator');
};

// <value> ::= <string> | <number>
ConditionParser.prototype._value = function()
{
  var values = ['string', 'number'];
  assert(this._tokenIn(values), this._errorString('[' + values.join(' | ') + ']'));

  if (this._token.type === 'string')
    this._string();
  else
    this._number();
};

// String terminal.
ConditionParser.prototype._string = function()
{
  this._matchType('string');
};

// Number terminal.
ConditionParser.prototype._number = function()
{
  this._matchType('number');
};

// Handles non-characters.  Verifies that the current token's type matches
// the passed-in type.  If not, an exception is raised.  If so, the token is
// advanced.
ConditionParser.prototype._matchType = function(type)
{
  assert(this._token !== null && this._token.type === type, this._errorString('<' + type + '>'));
  this._addNode();
  this._advance();
};

// Handles non-characters.  Verifies that the current token's value matches
// the passed-in value.  If not, an exception is raised.  If so, the token is
// advanced.
ConditionParser.prototype._matchValue = function(value)
{
  assert(this._token !== null && this._token.value === value, this._errorString(value));
  this._addNode();
  this._advance();
};

// Handles the basic character terminals, which aren't needed in the
// resulting sentence/tree.  These are the basic terminals: "{", "}", "[",
// "]", ":", ","
ConditionParser.prototype._charTerminal = function(c)
{
  assert(this._token !== null && c === this._token.value, this._errorString(c));
  this._advance();
};

// Checks that the current token is a null terminal.
ConditionParser.prototype._nullTerminal = function()
{
  assert(this._token !== null && this._token.type === 'null', this._errorString('null'));
  this._addNode();
  this._advance();
};

// Move to the next token, or set token to null if the end of the sentence is
// encountered.
ConditionParser.prototype._advance = function()
{
  assert(this._tokenInd < this._tokens.length, 'Encountered the end of the sentence prematurely.');

  if (++this._tokenInd < this._tokens.length)
    this._token = this._tokens[this._tokenInd];
  else
    this._token = null;
};

// Check if the current token matches one of the types on toks.
ConditionParser.prototype._tokenIn = function(tokTypes)
{
  return tokTypes.some(function(type)
  {
    return this._token.type === type;
  }.bind(this));
};

// Helper to create an error string.
ConditionParser.prototype._errorString = function(expected)
{
  var type  = this._token ? this._token.type  : 'EOL';
  var value = this._token ? this._token.value : 'EOL';

  return 'At index ' + this._tokenInd + '.  Expected ' + expected +
    ' but found type ' + type + ' with value ' + value + '.';
};

// Helper function to add a node to the parse tree.
ConditionParser.prototype._addNode = function()
{
  var node =
  {
    children: [],
    parent:   this._curNode,
    token:    this._token
  };

  // If there is no tree, this is the root node.
  if (this._tree === null)
  {
    this._tree = this._curNode = node;
    return;
  }

  // This node is a child of the current node.
  this._curNode.children.push(node);

  // If the current token is a non-terminal then make the new node the
  // current node.  The tree is structued with non-terminals having terminal
  // children.
  //          $eq
  //       /      \
  //    'name'   'Joe'
  if (!this._token.terminal)
    this._curNode = node;
};

module.exports = ConditionParser;

