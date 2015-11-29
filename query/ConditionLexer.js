'use strict';

var assert = require(__dirname + '/../util/assert');

/**
 * Initialize the lexer.
 */
function ConditionLexer() {}

/**
 * Parse the sentence into tokens.
 * @param condStr The condition string to parse.
 */
ConditionLexer.prototype.parse = function(condStr)
{
  // Make sure condStr is actually a string.  If it's an object, stringify it.
  if (typeof(condStr) === 'object')
    condStr = JSON.stringify(condStr);

  var len     = condStr.length;
  var tokens  = [];
  var curChar = '';
  var boolOps = ['$and', '$or'];
  var compOps = ['$eq', '$neq', '$lt', '$lte', '$gt', '$gte', '$like', '$notLike'];
  var nullOps = ['$is', '$isnt'];
  var str, nextQuote, nonNum;

  // Helper to add a token to the tokens array.
  function addToken(terminal, type, value)
  {
    tokens.push
    ({
      terminal: terminal,
      type:     type,
      value:    value
    });
  }

  for (var i = 0; i < len; ++i)
  {
    curChar = condStr[i];

    switch (curChar)
    {
      // Basic terminals.
      case '{':
      case '}':
      case '[':
      case ']':
      case ':':
      case ',':
        addToken(true, 'char', curChar);
        break;
      case '"':
        // Move past the quote.
        assert(++i < condStr.length, 'Expected character but found EOL.');

        // The string immediatly after the quote, and the index of the next quote.
        str       = condStr.substring(i);
        nextQuote = str.indexOf('"');

        // No next quote - hit EOL.
        assert(nextQuote !== -1, 'Expected quote but found EOL.');

        // Looks good - store the actual string and advance the token pointer.
        str = str.substring(0, nextQuote);
        i  += nextQuote;

        // Store the appropriate token.
        if (boolOps.indexOf(str) !== -1)
          addToken(false, 'boolean-operator', str);
        else if (compOps.indexOf(str) !== -1)
          addToken(false, 'comparison-operator', str);
        else if (str === '$in')
          addToken(false, 'in-comparison-operator', str);
        else if (nullOps.indexOf(str) !== -1)
          addToken(false, 'null-comparison-operator', str);
        else if (str[0] === ':')
          addToken(true, 'parameter', str);
        else
          addToken(true, 'column', str);
        break;

      // Number.
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
      case '-':
        str = condStr.substring(i);

        // The first character that's not part of a number.
        nonNum = str.search(/[^0-9\.\-\+]+/);

        // Number continues to the end of the string.
        if (nonNum === -1)
          nonNum = str.length;

        // Pull the number, and advance the token pointer.
        str = str.substring(0, nonNum);
        i  += nonNum - 1;

        assert(!isNaN(Number(str)), 'Expected number but found ' + str);
        addToken(true, 'number', Number(str));
        break;

      // Null.
      case 'n':
        str = condStr.substr(i, 4);
        assert(str === 'null', 'Expected null but found ' + str);
        addToken(true, 'null', null);
        i += 3;
        break;

      // Anything else is invalid.
      default:
        throw new Error('Unexpected character found ' + curChar);
    }
  }

  return tokens;
};

module.exports = ConditionLexer;

