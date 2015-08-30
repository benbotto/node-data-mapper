describe('ConditionCompiler test suite.', function()
{
  'use strict';

  var ConditionLexer  = require(__dirname + '/../query/ConditionLexer');
  var ConditionParser = require(__dirname + '/../query/ConditionParser');
  var ConditionCompiler = require(__dirname + '/../query/ConditionCompiler');
  var lexer           = new ConditionLexer();
  var parser          = new ConditionParser();
  var compiler        = new ConditionCompiler();

  // Compiles a single condition.
  it('compiles a single condition.', function()
  {
    var cond, tokens, tree;

    // $eq.
    cond   = {$eq: {name: 'Joe'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`name` = \'Joe\'');

    // $neq.
    cond   = {$neq: {name: 'Joe'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`name` <> \'Joe\'');

    // $lt.
    cond   = {$lt: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` < 30');

    // $lte.
    cond   = {$lte: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` <= 30');

    // $gt.
    cond   = {$gt: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` > 30');

    // $gte.
    cond   = {$gte: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` >= 30');
  });

  // Compiles a single null condition.
  it('compiles a single null condition.', function()
  {
    var cond, tokens, tree;

    // $is.
    cond   = {$is: {occupation: null}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`occupation` IS NULL');

    // $isnt.
    cond   = {$isnt: {occupation: null}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`occupation` IS NOT NULL');
  });

  // Compiles a single in condition.
  it('compiles a single in condition.', function()
  {
    var cond, tokens, tree;

    // Numbers.
    cond   = {$in: {shoeSize: [10, 10.5, 11]}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`shoeSize` IN (10, 10.5, 11)');

    // Strings.
    cond   = {$in: {employer: ['Jack\'s Bar', 'Coderz']}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`employer` IN (\'Jack\'\'s Bar\', \'Coderz\')');

    // Single condition.
    cond   = {$in: {shoeSize: [10]}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`shoeSize` IN (10)');
  });

  // Compiles a single boolean condition.
  it('compiles a single boolean condition.', function()
  {
    var cond, tokens, tree;

    // Single condition AND'd.
    cond   = {$and: [{$eq: {name: 'Joe'}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`name` = \'Joe\')');

    // Two conditions AND'd.
    cond   = {$and: [{$eq: {name: 'Joe'}}, {$gt: {age: 21}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`name` = \'Joe\' AND `age` > 21)');

    // Single condition OR'd.
    cond   = {$or: [{$eq: {name: 'Joe'}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`name` = \'Joe\')');

    // Two conditions OR'd.
    cond   = {$or: [{$eq: {name: 'Joe'}}, {$gt: {age: 21}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`name` = \'Joe\' OR `age` > 21)');
  });

  // Compiles some more complicated conditions.
  it('compiles some more complicated conditions.', function()
  {
    var cond, tokens, tree;

    // (`gender` = 'M' AND (`occupation` IS NULL OR `salary` <= 11000))
    cond =
    {
      $and:
      [
        {$eq: {gender: 'M'}},
        {
          $or:
          [
            {$is:  {occupation: null}},
            {$lte: {salary: 11000}}
          ]
        }
      ]
    };
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree))
      .toBe('(`gender` = \'M\' AND (`occupation` IS NULL OR `salary` <= 11000))');

    // ((`gender` = 'M' AND `age` > 23) OR (`gender` = 'F' AND `age` > 21))
    cond =
    {
      $or:
      [
        {$and: [ {$eq: {gender: 'M'}}, {$gt: {age: 23}} ]},
        {$and: [ {$eq: {gender: 'F'}}, {$gt: {age: 21}} ]}
      ]
    };
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree))
      .toBe('((`gender` = \'M\' AND `age` > 23) OR (`gender` = \'F\' AND `age` > 21))');
  });
});

