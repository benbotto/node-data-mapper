describe('ConditionLexer test suite.', function()
{
  'use strict';

  var ConditionLexer = require(__dirname + '/../query/ConditionLexer');
  var cl             = new ConditionLexer();
  var terminals      = ['{', '}', '[', ']', ':', ','];

  describe('ConditionLexer parse test suite.', function()
  {
    // Checks that the lexer can take an object or a string.
    it('checks that the lexer can take an object or a string.', function()
    {
      var cond = {$eq: {name: 'Joe'}};

      expect(cl.parse(cond)).toEqual(cl.parse(JSON.stringify(cond)));
    });
  });

  describe('ConditionLexer terminal test suite.', function()
  {
    // Checks the basic terminals.
    it('checks the basic terminals.', function()
    {
      terminals.forEach(function(term)
      {
        expect(cl.parse(term)).toEqual([{terminal: true, type: 'char', value: term}]);
      });
    });

    // Checks terminal combinations.
    it('checks terminal combinations.', function()
    {
      var tokens   = [];
      var sentence = '';
      var randInd;

      // Make a random sentence out of terminals, with expected tokens.
      for (var i = 0; i < 100; ++i)
      {
        randInd   = Math.floor(Math.random() * terminals.length);
        sentence += terminals[randInd];
        tokens.push({terminal: true, type: 'char', value: terminals[randInd]});
      }

      expect(cl.parse(sentence)).toEqual(tokens);
    });
  });

  describe('ConditionLexer string test suite.', function()
  {
    // Checks a basic string.
    it('checks a basic string.', function()
    {
      expect(cl.parse(JSON.stringify('JOE'))).toEqual([{terminal: true, type: 'string', value: 'JOE'}]);
      expect(cl.parse('"JOE"')).toEqual([{terminal: true, type: 'string', value: 'JOE'}]);
      expect(cl.parse('""')).toEqual([{terminal: true, type: 'string', value: ''}]);
      expect(cl.parse('"str1""str2"')).toEqual
      ([
        {terminal: true, type: 'string', value: 'str1'},
        {terminal: true, type: 'string', value: 'str2'}
      ]);
    });

    // Checks a string in a sentence.
    it('checks a string in a sentence.', function()
    {
      expect(cl.parse(JSON.stringify({name: 'JOE'}))).toEqual
      ([
        {terminal: true, type: 'char', value: '{'},
        {terminal: true, type: 'string', value: 'name'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'string', value: 'JOE'},
        {terminal: true, type: 'char', value: '}'}
      ]);
    });

    // Checks a string that ends in an opening quote.
    it('checks a string that ends in an opening quote.', function()
    {
      expect(function()
      {
        cl.parse('"');
      }).toThrowError('Expected character but found EOL.');
      expect(function()
      {
        cl.parse('"name":"');
      }).toThrowError('Expected character but found EOL.');
    });

    // Checks an unterminated string.
    it('checks an unterminated string.', function()
    {
      expect(function()
      {
        cl.parse('"name');
      }).toThrowError('Expected quote but found EOL.');
    });
  });

  describe('ConditionLexer number test suite.', function()
  {
    // Checks a basic number.
    it('checks a basic number.', function()
    {
      expect(cl.parse('1')).toEqual([{terminal: true, type: 'number', value: 1}]);
      expect(cl.parse('10')).toEqual([{terminal: true, type: 'number', value: 10}]);
      expect(cl.parse('1.0')).toEqual([{terminal: true, type: 'number', value: 1}]);
      expect(cl.parse('.5')).toEqual([{terminal: true, type: 'number', value: 0.5}]);
      expect(cl.parse('-4600.532')).toEqual([{terminal: true, type: 'number', value: -4600.532}]);
      expect(function()
      {
        cl.parse('46-.23');
      }).toThrowError('Expected number but found 46-.23');
    });

    // Checks multiple numbers.
    it('checks multiple numbers.', function()
    {
      expect(cl.parse('1,-10,14.5')).toEqual
      ([
        {terminal: true, type: 'number', value: 1},
        {terminal: true, type: 'char', value: ','},
        {terminal: true, type: 'number', value: -10},
        {terminal: true, type: 'char', value: ','},
        {terminal: true, type: 'number', value: 14.5}
      ]);
    });

    // Checks a number in a sentence.
    it('checks a number in a sentence.', function()
    {
      expect((cl.parse(JSON.stringify({$gt: {age: 60}})))).toEqual
      ([
        {terminal: true, type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$gt'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'char', value: '{'},
        {terminal: true, type: 'string', value: 'age'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'number', value: 60},
        {terminal: true, type: 'char', value: '}'},
        {terminal: true, type: 'char', value: '}'}
      ]);
    });
  });

  describe('ConditionLexer operator test suite.', function()
  {
    // Checks the basic operators.
    it('checks the basic operators.', function()
    {
      expect(cl.parse('"$and"')).toEqual([{terminal: false, type: 'boolean-operator', value: '$and'}]);
      expect(cl.parse('"$or"')).toEqual([{terminal: false, type: 'boolean-operator', value: '$or'}]);
      expect(cl.parse('"$eq"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$eq'}]);
      expect(cl.parse('"$neq"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$neq'}]);
      expect(cl.parse('"$lt"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$lt'}]);
      expect(cl.parse('"$lte"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$lte'}]);
      expect(cl.parse('"$gt"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$gt'}]);
      expect(cl.parse('"$gte"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$gte'}]);
      expect(cl.parse('"$in"')).toEqual([{terminal: false, type: 'in-comparison-operator', value: '$in'}]);
    });

    // Checks operators in a sentence.
    it('checks operators in a sentence.', function()
    {
      var cond =
      {
        $and:
        [
          {$eq: {name: 'Joe'}},
          {$gt: {age: 21}}
        ]
      };

      expect(cl.parse(JSON.stringify(cond))).toEqual
      ([
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'boolean-operator', value: '$and'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '['},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$eq'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: true,  type: 'string', value: 'name'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'string', value: 'Joe'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: ','},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$gt'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: true,  type: 'string', value: 'age'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'number', value: 21},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: ']'},
        {terminal: true,  type: 'char', value: '}'}
      ]);
    });
  });
});

