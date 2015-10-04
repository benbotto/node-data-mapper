xdescribe('OnConditionParser test suite.', function()
{
  'use strict';

  var ConditionLexer    = require(__dirname + '/../query/ConditionLexer');
  var OnConditionParser = require(__dirname + '/../query/OnConditionParser');
  var lexer             = new ConditionLexer();
  var parser            = new OnConditionParser();

  describe('OnConditionParser language validation test suite.', function()
  {
    // Checks a valid comparison.
    it('checks a valid comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$eq:  {'u.userID': 'pn.userID'}}));
        parser.parse(lexer.parse({$neq: {'u.userID': 'pn.userID'}}));
        parser.parse(lexer.parse({$lt:  {'u.userID': 'pn.userID'}}));
        parser.parse(lexer.parse({$lte: {'u.userID': 'pn.userID'}}));
        parser.parse(lexer.parse({$gt:  {'u.userID': 'pn.userID'}}));
        parser.parse(lexer.parse({$gte: {'u.userID': 'pn.userID'}}));
      }).not.toThrow();
    });

    // Checks a valid logical-condition.
    it('checks a valid logical-condition.', function()
    {
      expect(function()
      {
        var tokens = lexer.parse({$and: [{$eq: {'u.userID':'pn.userID'}}, {$eq: {'u.phoneType':'pn.phoneType'}}]});
        parser.parse(tokens);

        tokens = lexer.parse({$or: [{$eq: {'u.userID':'pn.userID'}}, {$eq: {'u.phoneType':'pn.phoneType'}}]});
        parser.parse(tokens);
      }).not.toThrow();
    });
  });

  describe('OnConditionParser invalid condition test suite.', function()
  {
    // Fails in initial condition.
    it('fails in initial condition.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse('"foo"'));
      }).toThrowError('At index 0.  Expected { but found type string with value foo.');

      expect(function()
      {
        parser.parse(lexer.parse('{"foo"}'));
      }).toThrowError('At index 1.  Expected [comparison-operator | boolean-operator] but found type string with value foo.');
    });

    // Checks the comparison non-terminal.
    it('checks the comparison non-terminal.', function()
    {
      expect(function()
      {
        // Valid: {"$eq":{"u.userID":"pn.userID"}}
        var tokens = lexer.parse('{"$eq":{"u.userID":"pn.userID"}}');
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$eq"{"u.userID":"pn.userID"}}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value {.');

      expect(function()
      {
        // Mising opening brace.
        var tokens = lexer.parse('{"$eq":"u.userID":"pn.userID"}}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected { but found type string with value u.userID.');

      expect(function()
      {
        // Mising first column.
        var tokens = lexer.parse('{"$eq":{123:"pn.userID"}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising second colon.
        var tokens = lexer.parse('{"$eq":{"u.userID""pn.userID"}}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected : but found type string with value pn.userID.');

      expect(function()
      {
        // Mising second column
        var tokens = lexer.parse('{"$eq":{"u.userID":123}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising closing brace.
        var tokens = lexer.parse('{"$eq":{"u.userID":"pn.userID"}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
    });

    // Checks the logical-condition non-terminal.
    it('checks the logical-condition non-terminal.', function()
    {
      expect(function()
      {
        // Valid {"$and":[{"$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}]}
        var tokens = lexer.parse('{"$and":[{"$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}]}');
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing opening bracket.
        var tokens = lexer.parse('{"$and":{"$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected [ but found type char with value {.');

      expect(function()
      {
        // Missing opening brace (this is thrown in condition, which is tested above).
        var tokens = lexer.parse('{"$and":["$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected { but found type comparison-operator with value $eq.');

      expect(function()
      {
        // Missing closing bracket.
        var tokens = lexer.parse('{"$and":[{"$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 23.  Expected ] but found type char with value }.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":{"u.userID":"pn.userID"}},{"$eq":{"u.phoneType":"pn.phoneType"}}]');
        parser.parse(tokens);
      }).toThrowError('At index 24.  Expected } but found type EOL with value EOL.');
    });
  });
});

