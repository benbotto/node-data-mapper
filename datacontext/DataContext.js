'use strict';

require('insulin').factory('ndm_DataContext',
  ['ndm_FromAdapter', 'ndm_Insert', 'ndm_DeleteModel', 'ndm_UpdateModel'],
  ndm_DataContextProducer);

function ndm_DataContextProducer(FromAdapter, Insert, DeleteModel, UpdateModel) {
  /** 
   * The main interface to the ORM, which provides access to CRUD operations.
   * This class is expected to be extended by the user, or created as a
   * singleton.
   */
  class DataContext {
    /**
     * Initialize the DC.
     * @param {Database} database - A Database instance to query.
     * @param {Escaper} escaper - An instance of an Escaper matching the
     * database type (i.e.  MySQLEscaper or MSSQLEscaper).
     * @param {QueryExecuter} - queryExecuter A QueryExecuter instance.
     */
    constructor(database, escaper, queryExecuter) {
      /**
       * @property {Database} database - A database instance.
       * @property {Escaper} escaper - An instance of an Escaper class that can
       * escape query parts.
       * @property {QueryExecuter} queryExecuter - An instance of a
       * QueryExecuter that can execute CRUD operations.
       */
      this.database      = database;
      this.escaper       = escaper;
      this.queryExecuter = queryExecuter;
    }

    /**
     * Create a new {@link FromAdapter} instance, which can then be used to
     * SELECT, DELETE, or UPDATE.
     * @see FromAdapter
     * @see From
     * @param {TableMetaList~TableMeta|string} meta - See the {@link From}
     * constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {FromAdapter} A FromAdapter instance.
     */
    from(meta, database) {
      database = database || this.database;
      return new FromAdapter(database, this.escaper, this.queryExecuter, meta);
    }

    /**
     * Create a new {@link Insert} instance.
     * @param {Object} model - See the {@link Insert} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {Insert} An Insert instance.
     */
    insert(model, database) {
      database = database || this.database;
      return new Insert(database, this.escaper, this.queryExecuter, model);
    }

    /**
     * Create a new {@link DeleteModel} instance that can be used to delete a
     * model by ID.  For complex DELETE operations, use the {@link
     * DataContext#from} method to obtain a {@link FromAdapter} instance, and
     * then call {@link FromAdapter#delete} on that instance.
     * @param {Object} model - See the {@link DeleteModel} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {DeleteModel} A DeleteModel instance.
     */
    delete(model, database) {
      database = database || this.database;
      return new DeleteModel(database, this.escaper, this.queryExecuter, model);
    }

    /**
     * Create a new UpdateModel instance that can be used to UPDATE a model by
     * ID.  For complex UPDATE operations, use the {@link DataContext#from}
     * method to obtain a {@link FromAdapter} instance, and then call {@link
     * FromAdapter#update} on that instance.
     * @param {Object} model - See the {@link UpdateModel} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {UpdateModel} A UpdateModel instance.
     */
    update(model, database) {
      database = database || this.database;
      return new UpdateModel(database, this.escaper, this.queryExecuter, model);
    }
  }

  return DataContext;
}

