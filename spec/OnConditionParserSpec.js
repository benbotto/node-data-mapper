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
        parser.parse(lexer.parse({'u.userID': 'pn.userID'}));
      }).not.toThrow();
    });

    // Checks a valid comparison-list.
    it('checks a valid comparison-list.', function()
    {
      expect(function()
      {
        var tokens = lexer.parse([{'u.userID':'pn.userID'},{'u.phoneType':'pn.phoneType'}]);
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
      }).toThrowError('At index 0.  Expected [ <pair-comparison> | <condition-list> ] but found type string with value foo.');
    });

    // Checks the pair-comparison non-terminal.
    it('checks the pair-comparison non-terminal.', function()
    {
      expect(function()
      {
        // Valid {"u.userID":"pn.userID"}
        var tokens = lexer.parse({'u.userID':'pn.userID'});
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Mising string.
        var tokens = lexer.parse('{123:"pn.userID"}');
        parser.parse(tokens);
      }).toThrowError('At index 1.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising colon.
        var tokens = lexer.parse('{"u.userID""pn.userID"}');
        parser.parse(tokens);
      }).toThrowError('At index 2.  Expected : but found type string with value pn.userID.');

      expect(function()
      {
        // Missing string.
        var tokens = lexer.parse('{"u.userID":123}');
        parser.parse(tokens);
      }).toThrowError('At index 3.  Expected <string> but found type number with value 123.');

      expect(function()
      {
        // Mising closing brace.
        var tokens = lexer.parse('{"u.userID":"pn.userID"');
        parser.parse(tokens);
      }).toThrowError('At index 4.  Expected } but found type EOL with value EOL.');
    });

    // Checks the condition-list non-terminal.
    it('checks the condition-list non-terminal.', function()
    {
      expect(function()
      {
        // Valid [{"u.userID":"pn.userID"},{"u.phoneType":"pn.phoneType"}]
        var tokens = lexer.parse([{'u.userID':'pn.userID'},{'u.phoneType':'pn.phoneType'}]);
        parser.parse(tokens);
      }).not.toThrow();

      expect(function()
      {
        // Missing opening bracket (interpreted as a pair-comparison, but trailing comma.
        var tokens = lexer.parse('{"u.userID":"pn.userID"},{"u.phoneType":"pn.phoneType"}]');
        parser.parse(tokens);
      }).toThrowError('At index 5.  Expected EOL but found type char with value ,.');

      expect(function()
      {
        // Missing comma bracket.
        var tokens = lexer.parse('[{"u.userID":"pn.userID"}{"u.phoneType":"pn.phoneType"}]');
        parser.parse(tokens);
      }).toThrowError('At index 6.  Expected ] but found type char with value {.');

      expect(function()
      {
        // Missing closing bracket.
        var tokens = lexer.parse('[{"u.userID":"pn.userID"},{"u.phoneType":"pn.phoneType"}');
        parser.parse(tokens);
      }).toThrowError('At index 12.  Expected ] but found type EOL with value EOL.');
    });
  });

  describe('OnConditionParser parse tree spec.', function()
  {
    // Checks the tree from a pair comparison.
    it('checks the tree from a pair comparison.', function()
    {
      var cond   = {'u.userID':'pn.userID'};
      var tokens = lexer.parse(cond);
      var tree   = parser.parse(tokens);

      expect(tree.length).toBe(2);
      expect(tree[0].value).toBe('u.userID');
      expect(tree[1].value).toBe('pn.userID');
    });

    // Checks the tree from a comparison list.
    it('checks the tree from a comparison list.', function()
    {
      var tokens = lexer.parse([{'u.userID':'pn.userID'},{'u.phoneType':'pn.phoneType'}]);
      var tree   = parser.parse(tokens);

      expect(tree.length).toBe(4);
      expect(tree[0].value).toBe('u.userID');
      expect(tree[1].value).toBe('pn.userID');
      expect(tree[2].value).toBe('u.phoneType');
      expect(tree[3].value).toBe('pn.phoneType');
    });
  });
});

