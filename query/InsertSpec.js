describe('Insert test suite.', function()
{
  'use strict';

  var Insert       = require('./Insert');
  var Database     = require('../database/Database');
  var MySQLEscaper = require('./MySQLEscaper');
  var db           = new Database(require('../spec/testDB'));
  var escaper      = new MySQLEscaper();
  var qryExec;

  beforeEach(function()
  {
    qryExec = jasmine.createSpyObj('qryExec', ['insert']);
  });

  describe('Insert constructor test suite.', function()
  {
    // Checks the basic constructor.
    it('checks the basic constructor.', function()
    {
      new Insert(db, escaper, qryExec, {});
    });
  });

  describe('Insert toString test suite.', function()
  {
    // Converts a basic model to a string.
    it('converts a basic model to a string.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users:
        [
          {first: 'Sandy', last: 'Perkins'}
        ]
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins')"
      );
    });

    // Checks that properties that are not table aliases are ignored.
    it('checks that properties that are not table aliases are ignored.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users:
        [
          {first: 'Sandy', last: 'Perkins'}
        ],
        another: []
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins')"
      );
    });

    // Checks that aliased table inserts are generated correctly.
    it('checks that aliased table inserts are generated correctly.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        phoneNumbers: {userID: 12, phoneNumber: '444-555-6666', type: 'mobile'}
      });

      expect(query.toString()).toBe
      (
        'INSERT INTO `phone_numbers` (`userID`, `phoneNumber`, `type`)\n' +
        "VALUES (12, '444-555-6666', 'mobile')"
      );
    });

    // Checks that apostrophes get escaped.
    it('checks that apostrophes get escaped.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users: {first: 'Sandy', last: "O'Hare"}
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'O\\'Hare')"
      );
    });

    // Checks that undefined values are skipped.
    it('checks that undefined values are skipped.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users: {first: 'Sandy'}
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`)\n' +
        "VALUES ('Sandy')"
      );
    });

    // Checks that null values work.
    it('checks that null values work.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users: {first: 'Sandy', last: null}
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', NULL)"
      );
    });

    // Checks that an array of models can be inserted.
    it('checks that an array of models can be inserted.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        users:
        [
          {first: 'Sandy', last: 'Perkins'},
          {first: 'Sandy', last: "O'Hare"}
        ]
      });

      expect(query.toString()).toEqual
      (
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'Perkins');\n\n" +
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        "VALUES ('Sandy', 'O\\'Hare')"
      );
    });

    // Checks that converters are used.
    it('checks that converters are used.', function()
    {
      var query = new Insert(db, escaper, qryExec,
      {
        products:
        [
          {description: 'Innova Valkyrie', isActive: true},
          {description: 'Innova Valkyrie', isActive: false},
          {description: 'Innova Valkyrie', isActive: null}
        ]
      });
      
      
      var converter = db.getTableByName('products').getColumnByName('isActive').getConverter();
      spyOn(converter, 'onSave').and.callThrough();

      expect(query.toString()).toEqual
      (
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', 1);\n\n" +
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', 0);\n\n" +
        'INSERT INTO `products` (`description`, `isActive`)\n' +
        "VALUES ('Innova Valkyrie', NULL)"
      );

      // The onSave method should not be called with nulls, so there should be
      // a call count of 2.
      expect(converter.onSave.calls.count()).toBe(2);
    });
  });
});

