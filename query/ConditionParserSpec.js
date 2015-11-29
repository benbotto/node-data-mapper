describe('ConditionParser test suite.', function()
{
  'use strict';

  var ConditionLexer  = require(__dirname + '/ConditionLexer');
  var ConditionParser = require(__dirname + '/ConditionParser');
  var lexer           = new ConditionLexer();
  var parser          = new ConditionParser();

  describe('ConditionParser language validation test suite.', function()
  {
    // Checks a valid comparison.
    it('checks a valid comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$eq: {name: ':name'}}));
        parser.parse(lexer.parse({$eq: {name: 'user.name'}}));
        parser.parse(lexer.parse({$eq: {age: 45}}));
      }).not.toThrow();
    });

    // Checks a valid null-comparison.
    it('checks a valid null-comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$is: {name: null}}));
        parser.parse(lexer.parse({$isnt: {name: null}}));
      }).not.toThrow();
    });

    // Checks a valid in-comparison.
    it('checks a valid in-comparison.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse({$in: {age: [45]}}));
        parser.parse(lexer.parse({$in: {age: [45, 46]}}));
        parser.parse(lexer.parse({$in: {age: [45, 46, 47, 48, 49, 50, 51]}}));
        parser.parse(lexer.parse({$in: {name: [':name0', ':name1']}}));
        parser.parse(lexer.parse({$in: {name: ['mother.name', 'father.name']}}));
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
            {$eq: {name: ':name'}}
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
            {$eq: {name: ':name'}},
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
            {$eq: {name: ':name'}},
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
    // Fails in initial condition.
    it('fails in initial condition.', function()
    {
      expect(function()
      {
        parser.parse(lexer.parse([1,2,3]));
      }).toThrowError('At index 0.  Expected { but found type char with value [.');

      expect(function()
      {
        // A condition must be an object.
        parser.parse(lexer.parse(JSON.stringify('name')));
      }).toThrowError('At index 0.  Expected { but found type column with value name.');

      expect(function()
      {
        // Must start with a comparison.
        var tokens = lexer.parse({name: ':name'});
        parser.parse(tokens);
      }).toThrowError('At index 1.  Expected [comparison-operator | null-comparison-operator | in-comparison-operator | boolean-operator] but found type column with value name.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$eq":{"name":":name"}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
    });

    // Checks the comparison non-terminal.
    it('checks the comparison non-terminal.', function()
    {
      expect(function()
      {
        // Valid.
        var tokens = lexer.parse({$eq: {name: ':name'}});
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$eq"{"name":":name"}}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value {.');

      expect(function()
      {
        // Mising brace.
        var tokens = lexer.parse('{"$eq":"name":":name"}}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected { but found type column with value name.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$eq":{123:":name"}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"$eq":{"name"":name"}}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected : but found type parameter with value :name.');

      expect(function()
      {
        // name must match a value.
        var tokens = lexer.parse('{"$eq":{"name":{"age":":name"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected [parameter | column | number] but found type char with value {.');

      expect(function()
      {
        // Mising closing brace.
        var tokens = lexer.parse('{"$eq":{"name":":name"');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected } but found type EOL with value EOL.');
    });

    // Checks the null-comparison non-terminal.
    it('checks the null-comparison non-terminal.', function()
    {
      expect(function()
      {
        // Valid {"$is":{"name":null}}
        var tokens = lexer.parse({$is: {name: null}});
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$is"{"name":null}}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value {.');

      expect(function()
      {
        // Missing opening brace.
        var tokens = lexer.parse('{"$is":"name":null}}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected { but found type column with value name.');

      expect(function()
      {
        // Missing string.
        var tokens = lexer.parse('{"$is":{:null}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <column> but found type char with value :.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$is":{123:null}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$is":{"name"null}}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected : but found type null with value null.');

      expect(function()
      {
        // Missing null.
        var tokens = lexer.parse('{"$is":{"name":}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected null but found type char with value }.');

      expect(function()
      {
        // String is not null.
        var tokens = lexer.parse('{"$is":{"name":":name"}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected null but found type parameter with value :name.');

      expect(function()
      {
        // 123 is not null.
        var tokens = lexer.parse('{"$is":{"name":123}}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected null but found type number with value 123.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$is":{"name":null}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
    });

    // Checks the in-comparison non-terminal.
    it('checks the in-comparison non-terminal.', function()
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
      }).toThrowError('At index 3.  Expected { but found type column with value age.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$in":{123:[12,3,4097]}}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

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
      }).toThrowError('At index 7.  Expected [parameter | column | number] but found type char with value ].');

      expect(function()
      {
        // Array ends with ,.
        var tokens = lexer.parse('{"$in":{"age":[1,]}}');
        parser.parse(tokens);
      }).toThrowError('At index 9.  Expected [parameter | column | number] but found type char with value ].');

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
      }).toThrowError('At index 13.  Expected } but found type EOL with value EOL.');
    });

    // Checks the logical-condition non-terminal.
    it('checks the logical-condition non-terminal.', function()
    {
      expect(function()
      {
        // Valid '{"$and":[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}'
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and"[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type char with value [.');

      expect(function()
      {
        // Missing opening bracket.
        var tokens = lexer.parse('{"$and":{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected [ but found type char with value {.');

      expect(function()
      {
        // Missing opening brace.
        var tokens = lexer.parse('{"$and":["$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected { but found type comparison-operator with value $eq.');

      expect(function()
      {
        // 123 is not a comparison operator.
        var tokens = lexer.parse('{"$and":[{123:{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected [comparison-operator | null-comparison-operator | in-comparison-operator | boolean-operator] but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq"{"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected : but found type char with value {.');

      expect(function()
      {
        // Missing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":"name":":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 7.  Expected { but found type column with value name.');

      expect(function()
      {
        // 123 is not a string.
        var tokens = lexer.parse('{"$and":[{"$eq":{123:":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 8.  Expected <column> but found type number with value 123.');

      expect(function()
      {
        // Missing colon.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name"":name"}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 9.  Expected : but found type parameter with value :name.');

      expect(function()
      {
        // name must match a value.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":{}}},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 10.  Expected [parameter | column | number] but found type char with value {.');

      expect(function()
      {
        // Missing closing brace.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"},{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 12.  Expected } but found type char with value ,.');

      expect(function()
      {
        // Missing comma.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}}{"$gt":{"age":30}}]}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value {.');

      expect(function()
      {
        // Unterminated array.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}},]}');
        parser.parse(tokens);
      }).toThrowError('At index 14.  Expected { but found type char with value ].');

      expect(function()
      {
        // Array not closed.
        var tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}}}');
        parser.parse(tokens);
      }).toThrowError('At index 13.  Expected ] but found type char with value }.');
    });
  });

  describe('ConditionParser parse tree spec.', function()
  {
    // Checks the tree from a comparison.
    it('checks the tree from a comparison.', function()
    {
      var cond   = {$eq: {name: ':name'}};
      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //     _$eq_
      //    /     \
      // 'name'  ':name'
      expect(tree.token.value).toBe('$eq');
      expect(tree.children.length).toBe(2);
      expect(tree.children[0].token.value).toBe('name');
      expect(tree.children[1].token.value).toBe(':name');
    });

    // Checks the parse tree from a null comparison.
    it('checks the parse tree from a null comparison.', function()
    {
      var cond   = {$isnt: {spouse: null}};
      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //    _$isnt_
      //   /       \
      // 'spouse'  null
      expect(tree.token.value).toBe('$isnt');
      expect(tree.children.length).toBe(2);
      expect(tree.children[0].token.value).toBe('spouse');
      expect(tree.children[1].token.value).toBe(null);
    });

    // Checks the tree from an in comparison.
    it('checks the tree from an in comparison.', function()
    {
      var cond   = {$in: {name: [':name0', ':name1', ':name2']}};
      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //     _________$in___________
      //    /       /       \       \
      // 'name' ':name0' ':name1' ':name2'
      expect(tree.token.value).toBe('$in');
      expect(tree.children.length).toBe(4);
      expect(tree.children[0].token.value).toBe('name');
      expect(tree.children[1].token.value).toBe(':name0');
      expect(tree.children[2].token.value).toBe(':name1');
      expect(tree.children[3].token.value).toBe(':name2');
    });

    // Checks the tree from a comparison list.
    it('checks the tree from a comparison list.', function()
    {
      var cond =
      {
        $and:
        [
          {$eq: {name: ':name'}},
          {$lt: {age: 60}},
          {$gt: {shoeSize: 10}}
        ]
      };

      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      //        __________$and_____________
      //       /            |              \
      //    _$eq_          $lt             $gt
      //   /     \        /   \           /   \
      // 'name' ':name' 'age'  60   'shoeSize' 10
      expect(tree.token.value).toBe('$and');
      expect(tree.children.length).toBe(3);

      var eq = tree.children[0];
      expect(eq.token.value).toBe('$eq');
      expect(eq.children.length).toBe(2);
      expect(eq.children[0].token.value).toBe('name');
      expect(eq.children[1].token.value).toBe(':name');

      var lt = tree.children[1];
      expect(lt.token.value).toBe('$lt');
      expect(lt.children.length).toBe(2);
      expect(lt.children[0].token.value).toBe('age');
      expect(lt.children[1].token.value).toBe(60);

      var gt = tree.children[2];
      expect(gt.token.value).toBe('$gt');
      expect(gt.children.length).toBe(2);
      expect(gt.children[0].token.value).toBe('shoeSize');
      expect(gt.children[1].token.value).toBe(10);
    });
  });

  // Checks a complex query.
  it('checks a complex query.', function()
  {
    // gender = :gender AND (age > 21 OR accidents <= 1)
    var cond =
    {
      $and:
      [
        {$eq: {gender: ':gender'}},
        {
          $or:
          [
            {$gt:  {age: 21}},
            {$lte: {accidents: 1}}
          ]
        }
      ]
    };
    var tokens = lexer.parse(cond);
    var tree   = parser.parse(tokens);

    //           ____$and______
    //          /              \
    //       __$eq__         __$or________
    //      /       \       /             \
    // 'gender' ':gender'  $gt         __$lte___
    //                    /   \       /         \
    //                  'age'  21   'accidents'  1
    expect(tree.token.value).toBe('$and');
    expect(tree.children.length).toBe(2);

    var eq = tree.children[0];
    expect(eq.token.value).toBe('$eq');
    expect(eq.children.length).toBe(2);
    expect(eq.children[0].token.value).toBe('gender');
    expect(eq.children[1].token.value).toBe(':gender');

    var or = tree.children[1];
    expect(or.token.value).toBe('$or');
    expect(or.children.length).toBe(2);

    var gt = or.children[0];
    expect(gt.token.value).toBe('$gt');
    expect(gt.children.length).toBe(2);
    expect(gt.children[0].token.value).toBe('age');
    expect(gt.children[1].token.value).toBe(21);

    var lte = or.children[1];
    expect(lte.token.value).toBe('$lte');
    expect(lte.children.length).toBe(2);
    expect(lte.children[0].token.value).toBe('accidents');
    expect(lte.children[1].token.value).toBe(1);
  });
});

