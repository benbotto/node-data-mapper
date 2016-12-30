describe('Insert()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Insert       = insulin.get('ndm_Insert');
  const MySQLEscaper = insulin.get('ndm_MySQLEscaper');
  const MySQLInsert  = insulin.get('ndm_MySQLInsert');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MySQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['insert']));

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends Query.', function() {
      const Query = insulin.get('ndm_Query');
      const ins   = new Insert(db, escaper, qryExec, {});

      expect(ins instanceof Query).toBe(true);
    });
  });

  /**
   * To string.
   */
  describe('.toString()', function() {
    it('returns the sql from buildQuery().', function() {
      const query = new Insert(db, escaper, qryExec, {});

      spyOn(query, 'buildQuery').and.returnValue([
        {sql: 'INSERT FOO1'},
        {sql: 'INSERT FOO2'}
      ]);

      expect(query.toString()).toBe(
        'INSERT FOO1;\n\n' +
        'INSERT FOO2'
      );
    });
  });

  /**
   * Execute.  Note that MySQLInsert is used for testing here, as it has a
   * concrete implementation of buildQuery() that makes testing easier.
   */
  describe('.execute()', function() {
    let insertId;

    beforeEach(function() {
      insertId = 0;
      qryExec  = jasmine.createSpyObj('qryExec', ['insert']);

      // When the QueryExecuter.insert method is called return
      // immediately with an insertId.  The insertId starts at
      // 1 and is incremented on each query.
      qryExec.insert.and.callFake((query, params, callback) => 
        callback(undefined, {insertId: ++insertId}));
    });

    it('uses the queryExecuter.insert() method to insert models.', function() {
      const query = new MySQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query.execute();
      expect(qryExec.insert).toHaveBeenCalled();
      expect(insertId).toBe(1);
    });

    it('calls the queryExecuter.insert() method once for each model.', function() {
      const query = new MySQLInsert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy',  last: 'Perkins'},
          {first: 'Cindy',  last: 'Perkins'},
          {first: 'Donald', last: 'Perkins'}
        ]
      });

      query.execute();
      expect(qryExec.insert.calls.count()).toBe(3);
      expect(insertId).toBe(3);
    });

    it('updates the primary key on the model when the insertId is available.', function() {
      const query = new MySQLInsert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy',  last: 'Perkins'},
          {first: 'Cindy',  last: 'Perkins'},
          {first: 'Donald', last: 'Perkins'}
        ]
      });

      query
        .execute()
        .then(function(result) {
          expect(result.users[0].ID).toBe(1);
          expect(result.users[1].ID).toBe(2);
          expect(result.users[2].ID).toBe(3);
        })
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('does not modify the model if no insertId is returned.', function() {
      qryExec.insert.and.callFake(function(query, params, callback) {
        callback(undefined, {});
      });

      const query = new MySQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query.execute().then(function(result) {
        expect(result.users.ID).not.toBeDefined();
      });
    });

    it('propagates errors from the queryExecuter.insert() method.', function() {
      const err   = new Error();
      const query = new MySQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      qryExec.insert.and.callFake((query, params, callback) => callback(err));

      query
        .execute()
        .then(() => expect(true).toBe(false))
        .catch(e => expect(e).toBe(err))
        .done();
    });

    it('passes the SQL to the queryExecuter.insert() method.', function() {
      qryExec.insert.and.callFake((query, params, callback) => {
        expect(query).toBe(
          'INSERT INTO `users` (`firstName`, `lastName`)\n' +
          'VALUES (:first, :last)');
        callback(undefined, {});
      });

      const query = new MySQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query
        .execute()
        .catch(() => expect(true).toBe(false))
        .done();
    });

    it('passes parameters to the queryExecuter.insert() method.', function() {
      qryExec.insert.and.callFake((query, params, callback) => {
        expect(params).toEqual({first: 'Sandy', last: 'Perkins'});
        callback(undefined, {});
      });

      const query = new MySQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });

      query
        .execute()
        .catch(() => expect(true).toBe(false))
        .done();
    });
  });
});

