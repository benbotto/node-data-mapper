describe('OnConditionParser test suite.', function()
{
  'use strict';

  var ConditionLexer    = require(__dirname + '/../query/ConditionLexer');
  var OnConditionParser = require(__dirname + '/../query/OnConditionParser');
  var lexer             = new ConditionLexer();
  var parser            = new OnConditionParser();

  describe('OnConditionParser language validation test suite.', function()
  {
    // Checks a valid pair-comparison.
    it('checks a valid pair-comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$eq: {'u.userID': 'pn.userID'}}));
      }).not.toThrow();
    });

    // Checks a valid comparison-list.
    it('checks a valid comparison-list.', function()
    {
      expect(function()
      {
        var cond = 
        {
          $and:
          [
            {$eq: {'u.userID': 'pn.userID'}}
          ]
        };
        parser.parse(lexer.parse(cond));
      }).not.toThrow();

      expect(function()
      {
        var cond = 
        {
          $and:
          [
            {$eq: {'u.userID': 'pn.userID'}},
            {$eq: {'u.phoneType':  'pn.phoneType'}}
          ]
        };
        parser.parse(lexer.parse(cond));
      }).not.toThrow();
    });
  });

  describe('OnConditionParser invalid condition test suite.', function()
  {
    // Fails in initial pair.
    it('fails in initial pair.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse([1,2,3]));
      }).toThrowError('At index 0.  Expected { but found type char with value [.');

      expect(function()
      {
        // A pair must be an object.
        parser.parse(lexer.parse(JSON.stringify('name')));
      }).toThrowError('At index 0.  Expected { but found type string with value name.');

      expect(function()
      {
        // Must start with a comparison.
        var tokens = lexer.parse({name: 'Joe'});
        parser.parse(tokens);
      }).toThrowError('At index 1.  Expected [comparison-operator | boolean-operator] but found type string with value name.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$eq":{"name":"Joe"}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
    });

    // Checks the pair-comparison non-terminal.
    it('checks the pair-comparison non-terminal.', function()
    {
      expect(function()
      {
        // Valid.
        var tokens = lexer.parse({$eq: {name: 'Joe'}});
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$eq"{"name":"Joe"}}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value {.');

      expect(function()
      {
        // Mising brace.
        var tokens = lexer.parse('{"$eq":"name":"Joe"}}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected { but found type string with value name.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$eq":{123:"Joe"}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$eq":{"name""Joe"}}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected : but found type string with value Joe.');

      expect(function()
      {
        // name must match a value.
        var tokens = lexer.parse('{"$eq":{"name":{"age":"Joe"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected <string> but found type char with value {.');

      expect(function()
      {
        // Mising closing brace.
        var tokens = lexer.parse('{"$eq":{"name":"Joe"');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected } but found type EOL with value EOL.');
    });

    // Checks the condition-list non-terminal.
    it('checks the condition-list non-terminal.', function()
    {
      expect(function()
      {
        // Valid '{"$and":[{"$eq":{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}'
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and"[{"$eq":{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value [.');

      expect(function()
      {
        // Missing opening bracket.
        var tokens = lexer.parse('{"$and":{"$eq":{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected [ but found type char with value {.');

      expect(function()
      {
        // Missing opening brace.
        var tokens = lexer.parse('{"$and":["$eq":{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected { but found type comparison-operator with value $eq.');

      expect(function()
      {
        // 123 is not a comparison operator.
        var tokens = lexer.parse('{"$and":[{123:{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected [comparison-operator | boolean-operator] but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq"{"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected : but found type char with value {.');

      expect(function()
      {
        // Missing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":"name":"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected { but found type string with value name.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$and":[{"$eq":{123:"Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name""Joe"}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 9.  Expected : but found type string with value Joe.');

      expect(function()
      {
        // name must match a value.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":{}}},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 10.  Expected <string> but found type char with value {.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Joe"},{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 12.  Expected } but found type char with value ,.');

      expect(function()
      {
        // Missing comma.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Joe"}}{"$eq":{"foo":"bar"}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value {.');

      expect(function()
      {
        // Unterminated array.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Joe"}},]}');
        parser.parse(tokens);
      }).toThrowError('At index 14.  Expected { but found type char with value ].');

      expect(function()
      {
        // Array not closed.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Joe"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value }.');
    });
  });

  describe('OnConditionParser parse tree spec.', function()
  {
    // Checks the tree from a pair comparison.
    it('checks the tree from a pair comparison.', function()
    {
      var cond   = {$eq: {name: 'Joe'}};
      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //     _$eq_
      //    /     \
      // 'name'  'Joe'
      expect(tree.token.value).toBe('$eq');
      expect(tree.children.length).toBe(2);
      expect(tree.children[0].token.value).toBe('name');
      expect(tree.children[1].token.value).toBe('Joe');
    });

    // Checks the tree from a comparison list.
    it('checks the tree from a comparison list.', function()
    {
      var cond =
      {
        $and:
        [
          {$eq: {name: 'Joe'}},
          {$eq: {foo:  'bar'}},
          {$eq: {bang: 'boom'}}
        ]
      };

      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //        __________$and_____________
      //       /            |              \
      //    _$eq_          $and            $and
      //   /     \        /   \           /   \
      // 'name' 'Joe'   'foo' 'bar'   'bang'  'boom'
      expect(tree.token.value).toBe('$and');
      expect(tree.children.length).toBe(3);

      var eq = tree.children[0];
      expect(eq.token.value).toBe('$eq');
      expect(eq.children.length).toBe(2);
      expect(eq.children[0].token.value).toBe('name');
      expect(eq.children[1].token.value).toBe('Joe');

      eq = tree.children[1];
      expect(eq.token.value).toBe('$eq');
      expect(eq.children.length).toBe(2);
      expect(eq.children[0].token.value).toBe('foo');
      expect(eq.children[1].token.value).toBe('bar');

      eq = tree.children[2];
      expect(eq.token.value).toBe('$eq');
      expect(eq.children.length).toBe(2);
      expect(eq.children[0].token.value).toBe('bang');
      expect(eq.children[1].token.value).toBe('boom');
    });
  });
});

