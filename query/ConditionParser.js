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
  var tree     = null;
  var curNode  = null;

  // Parse the program, and return the resulting parse tree.
  clause();
  return tree;

  // A clause (the full sentence/program) is a pair.  After the pair the token
  // should be null.
  function clause()
  {
    pair();
    assert(token === null, errorString('EOL'));
  }

  // <pair>            ::= "{" <pair-comparison> | <null-comparison> | <in-comparison> | <condition-list> "}"
  // <pair-comparison> ::= <comparison-operator> ":" "{" <string> ":" <value> "}"
  // <null-comparison> ::= <null-comparison-operator> ":" "{" <string> ":" null "}"
  // <in-comparison>   ::= <in-comparison-operator> ":" "{" <string> ":" "[" <value> {"," <value>} "]" "}"
  function pair()
  {
    var pairParts = ['comparison-operator', 'null-comparison-operator', 'in-comparison-operator', 'boolean-operator'];

    charTerminal('{');
    assert(tokenIn(pairParts), errorString('[' + pairParts.join(' | ') + ']'));

    if (token.type === 'comparison-operator')
      pairComparison();
    else if (token.type === 'null-comparison-operator')
      nullComparison();
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

  // <null-comparison> ::= <null-comparison-operator> ":" "{" <string> ":" null "}"
  function nullComparison()
  {
    nullComparisonOperator();
    charTerminal(':');
    charTerminal('{');
    string();
    charTerminal(':');
    nullTerminal();
    charTerminal('}');
  }

  // <condition-list> ::= <boolean-operator> ":" "[" <pair> {"," <pair>} "]"
  function conditionList()
  {
    booleanOperator();
    charTerminal(':');
    charTerminal('[');
    pair();
    // <boolean-operator> is preceded by an array of <pair>.  After adding each
    // <pair> node make the <boolean-operator> the current node.
    curNode = curNode.parent;
    while (token.value === ',')
    {
      charTerminal(',');
      pair();
      curNode = curNode.parent;
    }
    charTerminal(']');
  }

  // <comparison-operator> ::= "$eq" | "$neq" | "$lt" | "$lte" | "$gt" | "$gte"
  function comparisonOperator()
  {
    matchType('comparison-operator');
  }

  // <in-comparison-operator> ::= "$in"
  function inComparisonOperator()
  {
    matchType('in-comparison-operator');
  }

  // <null-comparison-operator> ::= "$is" | "$isnt"
  function nullComparisonOperator()
  {
    matchType('null-comparison-operator');
  }

  // <boolean-operator> ::= "$and" | "$or"
  function booleanOperator()
  {
    matchType('boolean-operator');
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
    matchType('string');
  }

  // Number terminal.
  function number()
  {
    matchType('number');
  }

  // Handles non-characters.  Verifies that the current token's type matches
  // the passed-in type.  If not, an exception is raised.  If so, the token is
  // advanced.
  function matchType(type)
  {
    assert(token !== null && token.type === type, errorString('<' + type + '>'));
    addNode();
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

  // Checks that the current token is a null terminal.
  function nullTerminal()
  {
    assert(token !== null && token.type === 'null', errorString('null'));
    addNode();
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
    var type  = token ? token.type  : 'EOL';
    var value = token ? token.value : 'EOL';

    return 'At index ' + tokenInd + '.  Expected ' + expected +
      ' but found type ' + type + ' with value ' + value + '.';
  }

  // Helper function to add a node to the parse tree.
  function addNode()
  {
    var node =
    {
      children: [],
      parent:   curNode,
      token:    token
    };

    // If there is no tree, this is the root node.
    if (tree === null)
    {
      tree = curNode = node;
      return;
    }

    // This node is a child of the current node.
    curNode.children.push(node);

    // If the current token is a non-terminal then make the new node the
    // current node.  The tree is structued with non-terminals having terminal
    // children.
    //          $eq
    //       /      \
    //    'name'   'Joe'
    if (!token.terminal)
      curNode = node;
  }
};

module.exports = ConditionParser;

