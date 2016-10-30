describe('ConditionLexer()', function() {
  'use strict';

  const insulin        = require('insulin');
  const ConditionLexer = insulin.get('ndm_ConditionLexer');
  const cl             = new ConditionLexer();

  /**
   * Parse.
   */
  describe('.parse()', function() {
    it('can parse an object or a string.', function() {
      const cond = {$eq: {name: ':name'}};
      expect(cl.parse(cond)).toEqual(cl.parse(JSON.stringify(cond)));
    });

    describe('terminal tests -', function() {
      const terminals = ['{', '}', '[', ']', ':', ','];

      it('parses all terminals.', function() {
        terminals.forEach(function(term) {
          expect(cl.parse(term)).toEqual([{terminal: true, type: 'char', value: term}]);
        });
      });

      it('fails on bad terminals.', function() {
        expect(function() {
          cl.parse('A');
        }).toThrowError('Unexpected character.  Found A.');
      });

      it('parses tokens in any order (100 random terminals used).', function() {
        const tokens   = [];
        let   sentence = '';
        let   randInd;

        for (let i = 0; i < 100; ++i) {
          randInd   = Math.floor(Math.random() * terminals.length);
          sentence += terminals[randInd];
          tokens.push({terminal: true, type: 'char', value: terminals[randInd]});
        }

        expect(cl.parse(sentence)).toEqual(tokens);
      });
    });

    describe('string tests -', function() {
      it('correctly parses trivial condition strings.', function() {
        expect(cl.parse(JSON.stringify('user.name')))
          .toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
        expect(cl.parse('"user.name"'))
          .toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
        expect(cl.parse('""'))
          .toEqual([{terminal: true, type: 'column', value: ''}]);
        expect(cl.parse('"str1""str2"')).toEqual([
          {terminal: true, type: 'column', value: 'str1'},
          {terminal: true, type: 'column', value: 'str2'}
        ]);
      });

      it('parses sentences.', function() {
        expect(cl.parse(JSON.stringify({name: 'user.name'}))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'name'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'column', value: 'user.name'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });

      it('fails if the string ends in an opening quote.', function() {
        expect(function() {
          cl.parse('"');
        }).toThrowError('Expected character but found EOL.');
        expect(function() {
          cl.parse('"name":"');
        }).toThrowError('Expected character but found EOL.');
      });

      it('fails if the string is unterminated.', function() {
        expect(function() {
          cl.parse('"name');
        }).toThrowError('Expected quote but found EOL.');
      });
    });

    describe('number tests -', function() {
      it('parses basic numbers.', function() {
        expect(cl.parse('1')).toEqual([{terminal: true, type: 'number', value: 1}]);
        expect(cl.parse('10')).toEqual([{terminal: true, type: 'number', value: 10}]);
        expect(cl.parse('1.0')).toEqual([{terminal: true, type: 'number', value: 1}]);
        expect(cl.parse('.5')).toEqual([{terminal: true, type: 'number', value: 0.5}]);
        expect(cl.parse('-4600.532'))
          .toEqual([{terminal: true, type: 'number', value: -4600.532}]);
        expect(cl.parse('0123')).toEqual([{terminal: true, type: 'number', value: 123}]);
        expect(function() {
          cl.parse('46-.23');
        }).toThrowError('Expected number but found 46-.23.');
      });

      it('parases multiple numbers.', function() {
        expect(cl.parse('1,-10,14.5')).toEqual([
          {terminal: true, type: 'number', value: 1},
          {terminal: true, type: 'char', value: ','},
          {terminal: true, type: 'number', value: -10},
          {terminal: true, type: 'char', value: ','},
          {terminal: true, type: 'number', value: 14.5}
        ]);
      });

      it('parses numbers in sentences.', function() {
        expect((cl.parse(JSON.stringify({$gt: {age: 60}})))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$gt'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'age'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'number', value: 60},
          {terminal: true, type: 'char', value: '}'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });
    });

    describe('null tests -', function() {
      it('parses the null terminal.', function() {
        expect(cl.parse('null')).toEqual([{terminal: true, type: 'null', value: null}]);
        expect(cl.parse('nullnull')).toEqual([
          {terminal: true, type: 'null', value: null},
          {terminal: true, type: 'null', value: null}
        ]);
      });

      it('parses null terminals in strings.', function() {
        expect(cl.parse('{"$is":{"name":null}}')).toEqual([
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'null-comparison-operator', value: '$is'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true , type: 'column', value: 'name'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'null', value: null},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'}
        ]);
      });
    });

    describe('operator tests -', function() {
      it('parses all the boolean operators.', function() {
        expect(cl.parse('"$and"'))
          .toEqual([{terminal: false, type: 'boolean-operator', value: '$and'}]);
        expect(cl.parse('"$or"'))
          .toEqual([{terminal: false, type: 'boolean-operator', value: '$or'}]);
        expect(cl.parse('"$eq"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$eq'}]);
        expect(cl.parse('"$neq"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$neq'}]);
        expect(cl.parse('"$lt"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$lt'}]);
        expect(cl.parse('"$lte"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$lte'}]);
        expect(cl.parse('"$gt"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$gt'}]);
        expect(cl.parse('"$gte"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$gte'}]);
        expect(cl.parse('"$like"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$like'}]);
        expect(cl.parse('"$notLike"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$notLike'}]);
        expect(cl.parse('"$in"'))
          .toEqual([{terminal: false, type: 'in-comparison-operator', value: '$in'}]);
        expect(cl.parse('"$is"'))
          .toEqual([{terminal: false, type: 'null-comparison-operator', value: '$is'}]);
        expect(cl.parse('"$isnt"'))
          .toEqual([{terminal: false, type: 'null-comparison-operator', value: '$isnt'}]);
      });

      it('parses operators in sentences.', function() {
        const cond = {
          $and: [
            {$eq: {name: ':name'}},
            {$gt: {age: 21}}
          ]
        };

        expect(cl.parse(JSON.stringify(cond))).toEqual([
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'boolean-operator', value: '$and'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '['},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$eq'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true,  type: 'column', value: 'name'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'parameter', value: ':name'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: ','},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$gt'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true,  type: 'column', value: 'age'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'number', value: 21},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: ']'},
          {terminal: true,  type: 'char', value: '}'}
        ]);
      });
    });

    describe('parameter tests -', function() {
      it('parases terminal parameters.', function() {
        expect(cl.parse(JSON.stringify(':name')))
          .toEqual([{terminal: true, type: 'parameter', value: ':name'}]);
      });

      it('parses parameters in sentences.', function() {
        expect(cl.parse(JSON.stringify({name: ':name'}))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'name'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'parameter', value: ':name'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });
    });
  });
});

