'use strict';

var assert = require(__dirname + '/../assert');

/**
 * This class is a recursive decent parser for a Condition, which is a
 * representation of a SQL condition (like a WHERE or an ON).  This parser
 * takes in a condition object (as defined in Condition), and makes sure that
 * it is a valid condition.  If the condition sentence does not match the
 * condition grammer an exception is raised.  Otherwise a parse tree is
 * created.
 */
function ConditionParser() {}

/**
 * Parse the condition (as an object) and return a parse tree.
 * @param tokens An array of tokens, as created by a ConditionLexer.
 */
ConditionParser.prototype.parse = function(tokens)
{
  var tokenInd = 0;
  var token    = tokens[tokenInd];

  // Parse the program.
  clause();

  // A clause (the full sentence/program) is a pair.  After the pair the token
  // should be null.
  function clause()
  {
    pair();
    assert(token === null, errorString('EOL'));
  }

  // <pair>            ::= "{" <pair-comparison> | <in-comparison> | <condition-list> "}"
  // <pair-comparison> ::= <comparison-operator> ":" "{" <string> ":" <value> "}"
  // <in-comparison>   ::= <in-comparison-operator> ":" "{" <string> ":" "[" <value> {"," <value>} "]" "}"
  // <condition-list>  ::= <boolean-operator> ":" "[" <pair> {"," <pair>} "]"
  function pair()
  {
    var pairParts = ['comparison-operator', 'in-comparison-operator', 'boolean-operator'];

    charTerminal('{');
    assert(tokenIn(pairParts), errorString('[' + pairParts.join(' | ') + ']'));

    if (token.type === 'comparison-operator')
      pairComparison();
    else if (token.type === 'in-comparison-operator')
      inComparison();
    else
      conditionList();

    charTerminal('}');
  }

  // <pair-comparison> ::= <comparison-operator> ":" "{" <string> ":" <value> "}"
  function pairComparison()
  {
    comparisonOperator();
    charTerminal(':');
    charTerminal('{');
    string();
    charTerminal(':');
    value();
    charTerminal('}');
  }

  // <in-comparison> ::= <in-comparison-operator> ":" "{" <string> ":" "[" <value> {"," <value>} "]" "}"
  function inComparison()
  {
    inComparisonOperator();
    charTerminal(':');
    charTerminal('{');
    string();
    charTerminal(':');
    charTerminal('[');
    value();
    while (token.value === ',')
    {
      charTerminal(',');
      value();
    }
    charTerminal(']');
    charTerminal('}');
  }

  // <condition-list> ::= <boolean-operator> ":" "[" <pair> {"," <pair>} "]"
  function conditionList()
  {
    booleanOperator();
    charTerminal(':');
    charTerminal('[');
    pair();
    while (token.value === ',')
    {
      charTerminal(',');
      pair();
    }
    charTerminal(']');
  }

  // <comparison-operator> ::= "$eq" | "$neq" | "$lt" | "$lte" | "$gt" | "$gte"
  function comparisonOperator()
  {
    terminalType('comparison-operator');
  }

  // <in-comparison-operator> ::= "$in"
  function inComparisonOperator()
  {
    terminalType('in-comparison-operator');
  }

  // <boolean-operator> ::= "$and" | "$or"
  function booleanOperator()
  {
    terminalType('boolean-operator');
  }

  // <value> ::= <string> | <number>
  function value()
  {
    var values = ['string', 'number'];
    assert(tokenIn(values), errorString('[' + values.join(' | ') + ']'));

    if (token.type === 'string')
      string();
    else
      number();
  }

  // String terminal.
  function string()
  {
    terminalType('string');
  }

  // Number terminal.
  function number()
  {
    terminalType('number');
  }

  // Handles non-character terminals (boolean-operator, string, number, etc.).
  function terminalType(type)
  {
    assert(token !== null && token.type === type, errorString('<' + type + '>'));
    advance();
  }

  // Handles the basic character terminals, which aren't needed in the
  // resulting sentence/tree.  These are the basic terminals: "{", "}", "[",
  // "]", ":", ","
  function charTerminal(c)
  {
    assert(token !== null && c === token.value, errorString(c));
    advance();
  }

  // Move to the next token, or set token to null if the end of the sentence is
  // encountered.
  function advance()
  {
    assert(tokenInd < tokens.length, 'Encountered the end of the sentence prematurely.');

    if (++tokenInd < tokens.length)
      token = tokens[tokenInd];
    else
      token = null;
  }

  // Check if the current token matches one of the types on toks.
  function tokenIn(tokTypes)
  {
    return tokTypes.some(function(type)
    {
      return token.type === type;
    });
  }

  // Helper to create an error string.
  function errorString(expected)
  {
    var type  = token ? token.type  : 'null';
    var value = token ? token.value : 'null';

    return 'At index ' + tokenInd + '.  Expected ' + expected +
      ' but found type ' + type + ' with value ' + value + '.';
  }
};

module.exports = ConditionParser;

