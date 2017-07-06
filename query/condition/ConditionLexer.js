'use strict';

require('insulin').factory('ndm_ConditionLexer',
  ['ndm_ConditionError'], ndm_ConditionLexerProducer);

function ndm_ConditionLexerProducer(ConditionError) {
  /** Class that lexicographically parses a condition into tokens. */
  class ConditionLexer {
    /**
     * Parse the sentence into tokens.
     * @param {string|object} condStr - The condition string to parse.  (If
     * condStr is an object it is converted to a string using JSON.stringify.
     * @return {Object[]} An array of tokens.  Each token object has the
     * following properties: terminal, which is a boolean indicating if the
     * token is a terminal or not; type, as described by the condition BNF;
     * and value.
     */
    parse(condStr) {
      // Make sure condStr is actually a string.  If it's an object, stringify it.
      if (typeof condStr === 'object')
        condStr = JSON.stringify(condStr);

      const len     = condStr.length;
      const tokens  = [];
      const boolOps = ['$and', '$or'];
      const compOps = ['$eq', '$neq', '$lt', '$lte', '$gt', '$gte', '$like', '$notLike'];
      const nullOps = ['$is', '$isnt'];

      let curChar = '';
      let str, nextQuote, nonNum;

      // Helper to add a token to the tokens array.
      function addToken(terminal, type, value) {
        tokens.push({terminal, type, value});
      }

      for (let i = 0; i < len; ++i) {
        curChar = condStr[i];

        switch (curChar) {
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
            if (++i >= condStr.length) 
              throw new ConditionError('Expected character but found EOL.');

            // The string immediatly after the quote, and the index of the next quote.
            str       = condStr.substring(i);
            nextQuote = str.indexOf('"');

            // No next quote - hit EOL.
            if (nextQuote === -1)
              throw new ConditionError('Expected quote but found EOL.');

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

            if (isNaN(Number(str)))
              throw new ConditionError(`Expected number but found ${str}.`);

            addToken(true, 'number', Number(str));
            break;

          // Null.
          case 'n':
            str = condStr.substr(i, 4);
            
            if (str !== 'null')
              throw new ConditionError(`Expected null but found ${str}.`);

            addToken(true, 'null', null);
            i += 3;
            break;

          // Anything else is invalid.
          default:
            throw new ConditionError(`Unexpected character.  Found ${curChar}.`);
        }
      }

      return tokens;
    }
  }

  return ConditionLexer;
}

