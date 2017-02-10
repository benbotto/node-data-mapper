describe('ConditionParser()', function() {
  'use strict';

  const insulin         = require('insulin');
  const ConditionParser = insulin.get('ndm_ConditionParser');
  const ConditionLexer  = insulin.get('ndm_ConditionLexer');
  const lexer           = new ConditionLexer();
  const parser          = new ConditionParser();

  describe('.parse()', function() {
    describe('valid comparisons -', function() {
      it('parses valid comparisons.', function() {
        expect(function() {
          parser.parse(lexer.parse({$eq: {name: ':name'}}));
          parser.parse(lexer.parse({$eq: {name: 'user.name'}}));
          parser.parse(lexer.parse({$eq: {age: 45}}));
        }).not.toThrow();
      });

      it('parses valid null-comparisons.', function() {
        expect(function() {
          parser.parse(lexer.parse({$is: {name: null}}));
          parser.parse(lexer.parse({$isnt: {name: null}}));
        }).not.toThrow();

        expect(function() {
          parser.parse(lexer.parse({$is: {name: ':name'}}));
          parser.parse(lexer.parse({$isnt: {name: ':name'}}));
        }).not.toThrow();
      });

      it('parses valid in-comparisons.', function() {
        expect(function() {
          parser.parse(lexer.parse({$in: {age: [45]}}));
          parser.parse(lexer.parse({$in: {age: [45, 46]}}));
          parser.parse(lexer.parse({$in: {age: [45, 46, 47, 48, 49, 50, 51]}}));
          parser.parse(lexer.parse({$in: {name: [':name0', ':name1']}}));
          parser.parse(lexer.parse({$in: {name: ['mother.name', 'father.name']}}));
        }).not.toThrow();
      });

      it('parses valid logical-conditions.', function() {
        expect(function() {
          const cond =  {
            $and: [
              {$eq: {name: ':name'}}
            ]
          };
          parser.parse(lexer.parse(cond));
        }).not.toThrow();

        expect(function() {
          const cond =  {
            $and: [
              {$eq: {name: ':name'}},
              {$eq: {age:  30}}
            ]
          };
          parser.parse(lexer.parse(cond));
        }).not.toThrow();

        expect(function() {
          const cond =  {
            $and: [
              {$eq: {name: ':name'}},
              {$eq: {age:  30}},
              {$gt: {shoeSize: 11}}
            ]
          };
          parser.parse(lexer.parse(cond));
        }).not.toThrow();
      });
    });

    describe('invalid conditions -', function() {
      it('fails if the initial part of the condition is invald.', function() {
        expect(function() {
          parser.parse(lexer.parse([1,2,3]));
        }).toThrowError('At index 0.  Expected { but found type char with value [.');

        expect(function() {
          // A condition must be an object.
          parser.parse(lexer.parse(JSON.stringify('name')));
        }).toThrowError('At index 0.  Expected { but found type column with value name.');

        expect(function() {
          // Must start with a comparison.
          const tokens = lexer.parse({name: ':name'});
          parser.parse(tokens);
        }).toThrowError('At index 1.  Expected [comparison-operator | null-comparison-operator | in-comparison-operator | boolean-operator] but found type column with value name.');

        expect(function() {
          // Missing closing brace.
          const tokens = lexer.parse('{"$eq":{"name":":name"}');
          parser.parse(tokens);
        }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
      });

      it('fails on invalid comparison non-terminals.', function() {
        expect(function() {
          // Valid.
          const tokens = lexer.parse({$eq: {name: ':name'}});
          parser.parse(tokens);
        }).not.toThrow();

        expect(function() {
          // Mising colon.
          const tokens = lexer.parse('{"$eq"{"name":":name"}}');
          parser.parse(tokens);
        }).toThrowError('At index 2.  Expected : but found type char with value {.');

        expect(function() {
          // Mising brace.
          const tokens = lexer.parse('{"$eq":"name":":name"}}');
          parser.parse(tokens);
        }).toThrowError('At index 3.  Expected { but found type column with value name.');

        expect(function() {
          // 123 is not a string.
          const tokens = lexer.parse('{"$eq":{123:":name"}}');
          parser.parse(tokens);
        }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

        expect(function() {
          // Mising colon.
          const tokens = lexer.parse('{"$eq":{"name"":name"}}');
          parser.parse(tokens);
        }).toThrowError('At index 5.  Expected : but found type parameter with value :name.');

        expect(function() {
          // name must match a value.
          const tokens = lexer.parse('{"$eq":{"name":{"age":":name"}}}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected [parameter | column | number] but found type char with value {.');

        expect(function() {
          // Mising closing brace.
          const tokens = lexer.parse('{"$eq":{"name":":name"');
          parser.parse(tokens);
        }).toThrowError('At index 7.  Expected } but found type EOL with value EOL.');
      });

      it('fails on invalid null-comparison non-terminals.', function() {
        expect(function() {
          // Valid {"$is":{"name":null}}
          const tokens = lexer.parse({$is: {name: null}});
          parser.parse(tokens);
        }).not.toThrow();

        expect(function() {
          // Valid {"$is":{"name":":name"}}
          const tokens = lexer.parse({$is: {name: ':name'}});
          parser.parse(tokens);
        }).not.toThrow();

        expect(function() {
          // Missing colon.
          const tokens = lexer.parse('{"$is"{"name":null}}');
          parser.parse(tokens);
        }).toThrowError('At index 2.  Expected : but found type char with value {.');

        expect(function() {
          // Missing opening brace.
          const tokens = lexer.parse('{"$is":"name":null}}');
          parser.parse(tokens);
        }).toThrowError('At index 3.  Expected { but found type column with value name.');

        expect(function() {
          // Missing string.
          const tokens = lexer.parse('{"$is":{:null}}');
          parser.parse(tokens);
        }).toThrowError('At index 4.  Expected <column> but found type char with value :.');

        expect(function() {
          // 123 is not a string.
          const tokens = lexer.parse('{"$is":{123:null}}');
          parser.parse(tokens);
        }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

        expect(function() {
          // Missing colon.
          const tokens = lexer.parse('{"$is":{"name"null}}');
          parser.parse(tokens);
        }).toThrowError('At index 5.  Expected : but found type null with value null.');

        expect(function() {
          // Missing null.
          const tokens = lexer.parse('{"$is":{"name":}}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected [null | parameter] but found type char with value }.');

        expect(function() {
          // String is not null.
          const tokens = lexer.parse('{"$is":{"name":"foo"}}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected [null | parameter] but found type column with value foo.');

        expect(function() {
          // 123 is not null.
          const tokens = lexer.parse('{"$is":{"name":123}}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected [null | parameter] but found type number with value 123.');

        expect(function() {
          // Missing closing brace.
          const tokens = lexer.parse('{"$is":{"name":null}');
          parser.parse(tokens);
        }).toThrowError('At index 8.  Expected } but found type EOL with value EOL.');
      });

      it('fails on invalid in-comparison non-terminals.', function() {
        expect(function() {
          // Valid '{"$in":{"age":[12,3,4097]}}'.
          const tokens = lexer.parse({$in: {age: [12,3,4097]}});
          parser.parse(tokens);
        }).not.toThrow();

        expect(function() {
          // Mising colon.
          const tokens = lexer.parse('{"$in"{"age":[12,3,4097]}}');
          parser.parse(tokens);
        }).toThrowError('At index 2.  Expected : but found type char with value {.');

        expect(function() {
          // Mising brace.
          const tokens = lexer.parse('{"$in":"age":[12,3,4097]}}');
          parser.parse(tokens);
        }).toThrowError('At index 3.  Expected { but found type column with value age.');

        expect(function() {
          // 123 is not a string.
          const tokens = lexer.parse('{"$in":{123:[12,3,4097]}}');
          parser.parse(tokens);
        }).toThrowError('At index 4.  Expected <column> but found type number with value 123.');

        expect(function() {
          // Mising colon.
          const tokens = lexer.parse('{"$in":{"age"[12,3,4097]}}');
          parser.parse(tokens);
        }).toThrowError('At index 5.  Expected : but found type char with value [.');

        expect(function() {
          // Mising bracket.
          const tokens = lexer.parse('{"$in":{"age":12,3,4097]}}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected [ but found type number with value 12.');

        expect(function() {
          // Empty array.
          const tokens = lexer.parse('{"$in":{"age":[]}}');
          parser.parse(tokens);
        }).toThrowError('At index 7.  Expected [parameter | column | number] but found type char with value ].');

        expect(function() {
          // Array ends with ,.
          const tokens = lexer.parse('{"$in":{"age":[1,]}}');
          parser.parse(tokens);
        }).toThrowError('At index 9.  Expected [parameter | column | number] but found type char with value ].');

        expect(function() {
          // Missing closing bracket.
          const tokens = lexer.parse('{"$in":{"age":[1,2,3}}');
          parser.parse(tokens);
        }).toThrowError('At index 12.  Expected ] but found type char with value }.');

        expect(function() {
          // Missing closing brace.
          const tokens = lexer.parse('{"$in":{"age":[1,2,3]');
          parser.parse(tokens);
        }).toThrowError('At index 13.  Expected } but found type EOL with value EOL.');
      });

      it('fails on invalid logical-condition non-terminals.', function() {
        expect(function() {
          // Valid '{"$and":[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}'
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).not.toThrow();

        expect(function() {
          // Missing colon.
          const tokens = lexer.parse('{"$and"[{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 2.  Expected : but found type char with value [.');

        expect(function() {
          // Missing opening bracket.
          const tokens = lexer.parse('{"$and":{"$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 3.  Expected [ but found type char with value {.');

        expect(function() {
          // Missing opening brace.
          const tokens = lexer.parse('{"$and":["$eq":{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 4.  Expected { but found type comparison-operator with value $eq.');

        expect(function() {
          // 123 is not a comparison operator.
          const tokens = lexer.parse('{"$and":[{123:{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 5.  Expected [comparison-operator | null-comparison-operator | in-comparison-operator | boolean-operator] but found type number with value 123.');

        expect(function() {
          // Missing colon.
          const tokens = lexer.parse('{"$and":[{"$eq"{"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 6.  Expected : but found type char with value {.');

        expect(function() {
          // Missing brace.
          const tokens = lexer.parse('{"$and":[{"$eq":"name":":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 7.  Expected { but found type column with value name.');

        expect(function() {
          // 123 is not a string.
          const tokens = lexer.parse('{"$and":[{"$eq":{123:":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 8.  Expected <column> but found type number with value 123.');

        expect(function() {
          // Missing colon.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name"":name"}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 9.  Expected : but found type parameter with value :name.');

        expect(function() {
          // name must match a value.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":{}}},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 10.  Expected [parameter | column | number] but found type char with value {.');

        expect(function() {
          // Missing closing brace.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"},{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 12.  Expected } but found type char with value ,.');

        expect(function() {
          // Missing comma.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}}{"$gt":{"age":30}}]}');
          parser.parse(tokens);
        }).toThrowError('At index 13.  Expected ] but found type char with value {.');

        expect(function() {
          // Unterminated array.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}},]}');
          parser.parse(tokens);
        }).toThrowError('At index 14.  Expected { but found type char with value ].');

        expect(function() {
          // Array not closed.
          const tokens = lexer.parse('{"$and":[{"$eq":{"name":":name"}}}');
          parser.parse(tokens);
        }).toThrowError('At index 13.  Expected ] but found type char with value }.');
      });
    });

    describe('parse tree -', function() {
      it('returns a valid tree from a comparison sentence.', function() {
        const cond   = {$eq: {name: ':name'}};
        const tokens = lexer.parse(cond);
        const tree   = parser.parse(tokens);

        //     _$eq_
        //    /     \
        // 'name'  ':name'
        expect(tree.token.value).toBe('$eq');
        expect(tree.children.length).toBe(2);
        expect(tree.children[0].token.value).toBe('name');
        expect(tree.children[1].token.value).toBe(':name');
      });

      it('returns a valid tree from a null-comparison sentence.', function() {
        const cond   = {$isnt: {spouse: null}};
        const tokens = lexer.parse(cond);
        const tree   = parser.parse(tokens);

        //    _$isnt_
        //   /       \
        // 'spouse'  null
        expect(tree.token.value).toBe('$isnt');
        expect(tree.children.length).toBe(2);
        expect(tree.children[0].token.value).toBe('spouse');
        expect(tree.children[1].token.value).toBe(null);
      });

      it('returns a valid tree from an in-comparison sentence.', function() {
        const cond   = {$in: {name: [':name0', ':name1', ':name2']}};
        const tokens = lexer.parse(cond);
        const tree   = parser.parse(tokens);

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

      it('returns a valid tree from a logical-condition sentence.', function() {
        const cond = {
          $and: [
            {$eq: {name: ':name'}},
            {$lt: {age: 60}},
            {$gt: {shoeSize: 10}}
          ]
        };

        const tokens = lexer.parse(cond);
        const tree   = parser.parse(tokens);

        //        __________$and_____________
        //       /            |              \
        //    _$eq_          $lt             $gt
        //   /     \        /   \           /   \
        // 'name' ':name' 'age'  60   'shoeSize' 10
        expect(tree.token.value).toBe('$and');
        expect(tree.children.length).toBe(3);

        const eq = tree.children[0];
        expect(eq.token.value).toBe('$eq');
        expect(eq.children.length).toBe(2);
        expect(eq.children[0].token.value).toBe('name');
        expect(eq.children[1].token.value).toBe(':name');

        const lt = tree.children[1];
        expect(lt.token.value).toBe('$lt');
        expect(lt.children.length).toBe(2);
        expect(lt.children[0].token.value).toBe('age');
        expect(lt.children[1].token.value).toBe(60);

        const gt = tree.children[2];
        expect(gt.token.value).toBe('$gt');
        expect(gt.children.length).toBe(2);
        expect(gt.children[0].token.value).toBe('shoeSize');
        expect(gt.children[1].token.value).toBe(10);
      });

      it('returns a valid tree from a complex sentence with nested logical-conditions.', function() {
        // gender = :gender AND (age > 21 OR accidents <= 1)
        const cond = {
          $and: [
            {$eq: {gender: ':gender'}},
            {
              $or: [
                {$gt:  {age: 21}},
                {$lte: {accidents: 1}}
              ]
            }
          ]
        };
        const tokens = lexer.parse(cond);
        const tree   = parser.parse(tokens);

        //           ____$and______
        //          /              \
        //       __$eq__         __$or________
        //      /       \       /             \
        // 'gender' ':gender'  $gt         __$lte___
        //                    /   \       /         \
        //                  'age'  21   'accidents'  1
        expect(tree.token.value).toBe('$and');
        expect(tree.children.length).toBe(2);

        const eq = tree.children[0];
        expect(eq.token.value).toBe('$eq');
        expect(eq.children.length).toBe(2);
        expect(eq.children[0].token.value).toBe('gender');
        expect(eq.children[1].token.value).toBe(':gender');

        const or = tree.children[1];
        expect(or.token.value).toBe('$or');
        expect(or.children.length).toBe(2);

        const gt = or.children[0];
        expect(gt.token.value).toBe('$gt');
        expect(gt.children.length).toBe(2);
        expect(gt.children[0].token.value).toBe('age');
        expect(gt.children[1].token.value).toBe(21);

        const lte = or.children[1];
        expect(lte.token.value).toBe('$lte');
        expect(lte.children.length).toBe(2);
        expect(lte.children[0].token.value).toBe('accidents');
        expect(lte.children[1].token.value).toBe(1);
      });
    });
  });
});


