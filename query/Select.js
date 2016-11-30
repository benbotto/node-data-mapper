'use strict';

require('insulin').factory('ndm_Select',
  ['deferred', 'ndm_assert', 'ndm_DataMapper', 'ndm_Query', 'ndm_Schema',
  'ndm_Column'],
  ndm_SelectProducer);

function ndm_SelectProducer(deferred, assert, DataMapper, Query, Schema,
  Column) {
  /**
   * Represents a SELECT query.
   * @extends Query
   */
  class Select extends Query {
    /**
     * Initialize the query using a From instance.
     * @param {From} from - A from instance.
     */
    constructor(from) {
      super(from.database, from.escaper, from.queryExecuter);

      this._from = from;

      // These are the columns that the user selected, by fully-qualified column name.
      this._selectCols = new Map();

      // The order of the query.
      this._orderBy = [];
    }

    /**
     * Select columns manually.
     * @param {...(object|string)} cols - An optional set of columns to select.
     * Each argument can either be a fully-qualified column name in the form
     * &lt;table-alias&gt;.&lt;column-name&gt;, or an object with the following
     * properties below.  If no columns are specified, then all columns are
     * selected.
     * @param {string} col.column - The fully-qualified column name.
     * @param {string} col.mapTo - The name of the property that the column
     * should be mapped to in the resulting normalized object.  @param
     * @param {function} col.convert - A converter function that takes a single value
     * from the database and transforms it.  For example, a function that
     * converts a bit from the database to a boolean value.
     * @return {this}
     */
    select(...cols) {
      const selTables = new Set();
      const colMaps   = new Set();
      let   tblMeta, pkAlias;

      // Select may only be performed once on a query.
      assert(this._selectCols.size === 0,
        'select already performed on query.');

      // If no columns are provided, select all.
      if (cols.length === 0)
        return this.selectAll();

      cols.forEach(function(userSelColMeta) {
        let fqColName, mapTo, fqColMap, availColMeta, selColMeta, convert;

        // Each column is an object, but can be short-handed as a string.  If a
        // a string is passed convert it to object format.
        if (typeof userSelColMeta === 'string')
          userSelColMeta = {column: userSelColMeta};

        // Make sure the column is legal for selection.
        fqColName = userSelColMeta.column;
        assert(this._from._tableMetaList.isColumnAvailable(fqColName),
          `The column name ${fqColName} is not available for selection.  ` +
          `Column names must be fully-qualified (<table-alias>.<column-name>).`);

        // Store the necessary metadata about the column selection.
        // This is what's needed for converting the query to a string, and
        // for serialization.
        availColMeta = this._from._tableMetaList.availableCols.get(fqColName);
        mapTo        = userSelColMeta.mapTo || availColMeta.column.mapTo;
        fqColMap     = Column.createFQColName(availColMeta.tableAlias, mapTo);
        convert      = userSelColMeta.convert || availColMeta.column.converter.onRetrieve;

        selColMeta = {
          tableAlias: availColMeta.tableAlias,
          column:     availColMeta.column,
          mapTo:      mapTo,
          fqColName:  fqColName,
          convert:    convert
        };

        // Column mapping must be unique (e.g. there cannot be two results
        // mapped to user.name).
        assert(!colMaps.has(fqColMap),
          `Column mapping "${fqColMap}" already selected.`);
        colMaps.add(fqColMap);

        // Each column can only be selected once.  This is only a constraint because
        // of the way that the primary key is found in execute.  If the primary key
        // of a table was selected twice, there would not be a way to serialize
        // the primary key correctly.
        assert(!this._selectCols.has(fqColName),
          `Column ${fqColName} already selected.`);
        
        // Column is unique - save it in the list of selected columns with a
        // lookup.
        this._selectCols.set(fqColName, selColMeta);

        // Store the list of tables that were selected from.
        selTables.add(availColMeta.tableAlias);
      }, this);

      // The primary key from each table must be selected.  The serialization
      // needs a way to uniquely identify each object; the primary key is used
      // for this.
      for (let tblAlias of selTables) {
        tblMeta = this._from._tableMetaList.tableMetas.get(tblAlias);

        // This is the primary key of the table, which is an array.
        for (let i = 0; i < tblMeta.table.primaryKey.length; ++i) {
          // This is the alias of the column in the standard
          // <table-alias>.<column-name> format.
          pkAlias = Column.createFQColName(tblMeta.as, tblMeta.table.primaryKey[i].name);

          assert(this._selectCols.has(pkAlias),
            'If a column is selected from a table, then the primary key ' +
            'from that table must also be selected.  The primary key of table ' +
            `"${tblMeta.table.name}" (alias "${tblMeta.as}") ` +
            'is not present in the array of selected columns.');
        }
      }

      // The primary key from the from table is also required.
      assert(selTables.has(this._from.getFromMeta().as),
        'The primary key of the from table is required.');

      return this;
    }

    /**
     * Select all columns, which is the default if no columns are specified.
     * This function gets called in execute and in toString if no columns are
     * selected.
     * @return {this}
     */
    selectAll() {
      const allCols = Array.from(
        this._from._tableMetaList.availableCols.values()).map(col => col.fqColName);

      return this.select.apply(this, allCols);
    }

    /**
     * Order by one or more columns.  This function is variadic.
     * @param {...string|...object} metas - A list of fully-qualified column names in the form
     * &lt;table-alias&gt;.&lt;column-name&gt;, or an array of objects with the
     *        following properties.
     * @param {string} metas.column - The fully-qualified column name.
     * @param {string} metas.dir - The sort direction; either "ASC" or "DESC."
     * @return {this}
     */
    orderBy(...metas) {
      // orderBy may only be called once.
      assert(this._orderBy.length === 0, 'orderBy already performed on query.');

      metas.forEach(function(meta) {
        let col, tblAlias, colName;

        if (typeof meta === 'string')
          meta = {column: meta};

        if (!meta.dir)
          meta.dir = 'ASC';

        assert(meta.column, 'orderBy column is required.');
        assert(meta.dir === 'ASC' || meta.dir === 'DESC',
          'dir must be either "ASC" or "DESC."');

        // Make sure the column is available for ordering.
        assert(this._from._tableMetaList.availableCols.has(meta.column),
          `"${meta.column}" is not available for orderBy.`);
        col = this._from._tableMetaList.availableCols.get(meta.column);

        // The order by is in the format `<table-alias>`.`<column-name>`.
        tblAlias = this.escaper.escapeProperty(col.tableAlias);
        colName  = this.escaper.escapeProperty(col.column.name);

        this._orderBy.push(tblAlias + '.' + colName + ' ' + meta.dir);
      }, this);

      return this;
    }

    /**
     * Get the SQL that represents the query.
     * @return {string} The SQL representing the select statement.
     */
    toString() {
      let sql = 'SELECT  ';
      let cols;

      // No columns specified.  Get all columns.
      if (this._selectCols.size === 0)
        this.selectAll();

      // Escape each selected column and add it to the query.
      cols = Array.from(this._selectCols.values());
      sql += cols.map(function(col) {
        const colName  = this.escaper.escapeProperty(col.column.name);
        const colAlias = this.escaper.escapeProperty(col.fqColName);
        const tblAlias = this.escaper.escapeProperty(col.tableAlias);

        return `${tblAlias}.${colName} AS ${colAlias}`;
      }, this).join(',\n        ');

      // Add the FROM (which includes the JOINS and WHERE).
      sql += '\n';
      sql += this._from.toString();

      // Add the order.
      if (this._orderBy.length !== 0) {
        sql += '\n';
        sql += 'ORDER BY ';
        sql += this._orderBy.join(', ');
      }

      return sql;
    }

    /**
     * Execute the query.
     * @return {Promise<object>} A promise that shall be resolved with the
     * normalized query results as an object.  The object will contain a key
     * for each top-level table mapping.
     * If an error occurs while executing
     * the query, the returned promise shall be rejected with the unmodified
     * error.
     */
    execute() {
      // Top-level schemata, indexed by mapping (mapTo property).
      const schemata     = {};
      // Schema lookup by table alias.
      const schemaLookup = {};
      const defer        = deferred();

      // No columns specified.  Get all columns.
      if (this._selectCols.size === 0)
        this.selectAll();

      // The primary key for each table is needed to create each schema.  Find
      // each primary key and create the schema.
      this._from._tableMetaList.tableMetas.forEach(function(tblMeta) {
        const pk = tblMeta.table.primaryKey;
        let   fqColName, colMeta, schema;

        // TODO: Composite keys are not yet implemented.
        assert(pk.length === 1, 'Composite keys are not currently supported.');

        // Create the schema.  In the query, the PK column name will be the fully-qualified
        // column alias.  The serialized property should be the column alias.
        fqColName = Column.createFQColName(tblMeta.as, pk[0].name);
        colMeta   = this._selectCols.get(fqColName);

        // The table might not be included (that is, no columns from the table are
        // selected).
        if (colMeta !== undefined) {
          schema = new Schema(colMeta.fqColName, colMeta.mapTo, colMeta.convert);

          // Keep a lookup of table alias->schema.
          schemaLookup[tblMeta.as] = schema;
          
          // If this table has no parent then the schema is top level.  Else
          // this is a sub schema, and the parent is guaranteed to be present in
          // the lookup.
          if (tblMeta.parent === null)
            schemata[tblMeta.mapTo] = schema;
          else
            schemaLookup[tblMeta.parent].addSchema(tblMeta.mapTo, schema, tblMeta.relType);
        }
      }, this);

      // Add each column/property to its schema.
      this._selectCols.forEach(function(colMeta) {
        // PK already present.
        if (!colMeta.column.isPrimary) {
          schemaLookup[colMeta.tableAlias].addProperty(
            colMeta.fqColName, colMeta.mapTo, colMeta.convert);
        }
      });

      // Execute the query.
      this.queryExecuter.select(this.toString(), function(err, result) {
        if (err)
          defer.reject(err);
        else {
          const serialized = {};
          const dm         = new DataMapper();

          for (let tblMapping in schemata)
            serialized[tblMapping] = dm.serialize(result, schemata[tblMapping]);

          defer.resolve(serialized);
        }
      });

      // A promise is returned.  It will be resolved with the serialized results.
      return defer.promise;
    }
  }

  return Select;
}

