describe('ConditionParser test suite.', function()
{
  'use strict';

  var ConditionLexer  = require(__dirname + '/../query/ConditionLexer');
  var ConditionParser = require(__dirname + '/../query/ConditionParser');
  var lexer           = new ConditionLexer();
  var parser          = new ConditionParser();

  describe('ConditionParser language validation test suite.', function()
  {
    // Checks a valid pair-comparison.
    it('checks a valid pair-comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$eq: {name: 'Joe'}}));
      }).not.toThrow();

      expect(function()
      {
        parser.parse(lexer.parse({$eq: {age: 45}}));
      }).not.toThrow();
    });

    // Checks a valid in-comparison.
    it('checks a valid in-comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$in: {age: [45]}}));
      }).not.toThrow();

      expect(function()
      {
        parser.parse(lexer.parse({$in: {age: [45, 46]}}));
      }).not.toThrow();

      expect(function()
      {
        parser.parse(lexer.parse({$in: {age: [45, 46, 47, 48, 49, 50, 51]}}));
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
            {$eq: {name: 'Joe'}}
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
            {$eq: {name: 'Joe'}},
            {$eq: {age:  30}}
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
            {$eq: {name: 'Joe'}},
            {$eq: {age:  30}},
            {$gt: {shoeSize: 11}}
          ]
        };
        parser.parse(lexer.parse(cond));
      }).not.toThrow();
    });
  });

  describe('ConditionParser invalid condition test suite.', function()
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
      }).toThrowError('At index 1.  Expected [comparison-operator | in-comparison-operator | boolean-operator] but found type string with value name.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$eq":{"name":"Joe"}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected } but found type null with value null.');
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
      }).toThrowError('At index 6.  Expected [string | number] but found type char with value {.');

      expect(function()
      {
        // Mising closing brace.
        var tokens = lexer.parse('{"$eq":{"name":"Joe"');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected } but found type null with value null.');
    });

    // Checks the in-comparison non-terminal.
    it('checks the in-comparison nonterminal.', function()
    {
      expect(function()
      {
        // Valid '{"$in":{"age":[12,3,4097]}}'.
        var tokens = lexer.parse({$in: {age: [12,3,4097]}});
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$in"{"age":[12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value {.');

      expect(function()
      {
        // Mising brace.
        var tokens = lexer.parse('{"$in":"age":[12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected { but found type string with value age.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$in":{123:[12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$in":{"age"[12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected : but found type char with value [.');

      expect(function()
      {
        // Mising bracket.
        var tokens = lexer.parse('{"$in":{"age":12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected [ but found type number with value 12.');

      expect(function()
      {
        // Empty array.
        var tokens = lexer.parse('{"$in":{"age":[]}}');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected [string | number] but found type char with value ].');

      expect(function()
      {
        // Array ends with ,.
        var tokens = lexer.parse('{"$in":{"age":[1,]}}');
        parser.parse(tokens);
      }).toThrowError('At index 9.  Expected [string | number] but found type char with value ].');

      expect(function()
      {
        // Missing closing bracket.
        var tokens = lexer.parse('{"$in":{"age":[1,2,3}}');
        parser.parse(tokens);
      }).toThrowError('At index 12.  Expected ] but found type char with value }.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$in":{"age":[1,2,3]');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected } but found type null with value null.');
    });

    // Checks the condition-lista non-terminal.
    it('checks the condition-lista non-terminal.', function()
    {
      expect(function()
      {
        // Valid '{"$and":[{"$eq":{"name":"Ben"}},{"$gt":{"age":30}}]}'
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and"[{"$eq":{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value [.');

      expect(function()
      {
        // Missing opening bracket.
        var tokens = lexer.parse('{"$and":{"$eq":{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected [ but found type char with value {.');

      expect(function()
      {
        // Missing opening brace.
        var tokens = lexer.parse('{"$and":["$eq":{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected { but found type comparison-operator with value $eq.');

      expect(function()
      {
        // 123 is not a comparison operator.
        var tokens = lexer.parse('{"$and":[{123:{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected [comparison-operator | in-comparison-operator | boolean-operator] but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq"{"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected : but found type char with value {.');

      expect(function()
      {
        // Missing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":"name":"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected { but found type string with value name.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$and":[{"$eq":{123:"Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name""Ben"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 9.  Expected : but found type string with value Ben.');

      expect(function()
      {
        // name must match a value.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":{}}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 10.  Expected [string | number] but found type char with value {.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Ben"},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 12.  Expected } but found type char with value ,.');

      expect(function()
      {
        // Missing comma.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Ben"}}{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value {.');

      expect(function()
      {
        // Unterminated array.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Ben"}},]}');
        parser.parse(tokens);
      }).toThrowError('At index 14.  Expected { but found type char with value ].');

      expect(function()
      {
        // Array not closed.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":"Ben"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value }.');
    });
  });
});

