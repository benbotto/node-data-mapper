xdescribe('OnConditionCompiler test suite.', function()
{
  'use strict';

  var ConditionLexer      = require(__dirname + '/../query/ConditionLexer');
  var OnConditionParser   = require(__dirname + '/../query/OnConditionParser');
  var OnConditionCompiler = require(__dirname + '/../query/OnConditionCompiler');
  var lexer               = new ConditionLexer();
  var parser              = new OnConditionParser();
  var compiler            = new OnConditionCompiler();

  // Compiles a single condition.
  it('compiles a single condition.', function()
  {
    var cond, tokens, tree;

    cond   = {'u.userID': 'pn.userID'};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`u.userID` = `pn.userID`');
  });

  // Checks a condition list.
  it('checks a condition list.', function()
  {
    var cond, tokens, tree;

    cond   = [{'u.userID':'pn.userID'},{'u.phoneType':'pn.phoneType'}];
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`u.userID` = `pn.userID` AND `u.phoneType` = `pn.phoneType`');
  });

  describe('OnConditionCompiler parseColumns test suite', function()
  {
    // Checks the columns from a single condition.
    it('checks the columns from a single condition.', function()
    {
      var cond, tokens, tree;

      cond   = {'u.userID': 'pn.userID'};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['u.userID', 'pn.userID']);
    });
 
    // Checks the columns from a condition list.
    it('checks the columns from a condition list.', function()
    {
      var cond, tokens, tree;

      cond   = [{'u.userID':'pn.userID'},{'u.phoneType':'pn.phoneType'}];
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['u.userID', 'pn.userID', 'u.phoneType', 'pn.phoneType']);
    });

    // Makes sure that the columns are unique.
    it('makes sure that the columns are unique.', function()
    {
      var cond, tokens, tree;

      cond   = [{'u.userID':'pn.userID'},{'u.userID':'pn.phoneType'}];
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['u.userID', 'pn.userID', 'pn.phoneType']);
    });
  });
});

