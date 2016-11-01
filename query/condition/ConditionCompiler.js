'use strict';

require('insulin').factory('ndm_ConditionCompiler',
  ['ndm_assert'], ndm_ConditionCompilerProducer);

function ndm_ConditionCompilerProducer(assert) {
  /** A class that compiles a parse tree, as created by a ConditionParser
  instance, into a SQL condition. */
  class ConditionCompiler {
    /**
     * Initialize the compiler.
     * @param {Escaper} - An instance of an Escaper that matches the database
     * type (e.g. MySQLEscaper for a MySQL database).
     */
    constructor(escaper) {
      this._escaper = escaper;
    }

    /**
     * Compile the parse tree.
     * @param {object} parseTree - A parse tree object, as created by the
     * ConditionParser.parse() method.
     * @param {object} params - An object containing key-value pairs that are used to
     * replace parameters in the query.
     * @return {string} The compiled condition as a SQL string.
     */
    compile(parseTree, params) {
      const compOps = {
        $eq:      '=',
        $neq:     '<>',
        $lt:      '<',
        $lte:     '<=',
        $gt:      '>',
        $gte:     '>=',
        $like:    'LIKE',
        $notLike: 'NOT LIKE'
      };

      const nullOps = {
        $is:   'IS',
        $isnt: 'IS NOT'
      };

      const boolOps = {
        $and: 'AND',
        $or:  'OR'
      };

      params = params || {};

      // Function to recursively traverse the parse tree and compile it.
      function traverse(tree, escaper, params) {
        // Helper to return a <value>, which may be a parameter, column, or number.
        // The return is escaped properly.
        function getValue(token, escaper) {
          // The token could be a column, a parameter, or a number.
          if (token.type === 'column')
            return escaper.escapeFullyQualifiedColumn(token.value);
          else if (token.type === 'parameter') {
            // Find the value in the params list (the leading colon is removed).
            const value = params[token.value.substring(1)];
            assert(value, `Replacement value for parameter ${token.value} not present.`);
            return escaper.escapeLiteral(value);
          }
          else
            return token.value;
        }

        switch (tree.token.type) {
          case 'comparison-operator': {
            // <column> <comparison-operator> <value> (ex. `users`.`name` = :name)
            // where value is a parameter, column, or number.
            const column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value);
            const op     = compOps[tree.token.value];
            const value  = getValue(tree.children[1].token, escaper);

            return `${column} ${op} ${value}`;
          }

          case 'null-comparison-operator': {
            // <column> <null-operator> <nullable> (ex. `j`.`occupation` IS NULL).
            // Note that if a parameter is used (e.g. {occupation: null}) it's
            // ignored.  NULL is blindly inserted since it's the only valid value.
            const column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value);
            const op     = nullOps[tree.token.value];

            return `${column} ${op} NULL`;
          }

          case 'in-comparison-operator': {
            // <column> IN (<value> {, <value}) (ex. `shoeSize` IN (10, 10.5, 11)).
            const column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value);
            const kids   = tree.children
              .slice(1)
              .map(kid => getValue(kid.token, escaper))
              .join(', ');

            return `${column} IN (${kids})`;
          }

          case 'boolean-operator': {
            // Each of the children is a <condition>.  Put each <condition> in an array.
            const kids = tree.children
              .map(kid => traverse(kid, escaper, params))
              .join(` ${boolOps[tree.token.value]} `);

            // Explode the conditions on the current boolean operator (AND or OR).
            // Boolean conditions must be wrapped in parens for precedence purposes.
            return `(${kids})`;
          }

          default: {
            // The only way this can fire is if the input parse tree did not come
            // from the ConditionParser.  Trees from the ConditionParser are
            // guaranteed to be syntactically correct.
            throw new Error(`Unknown type: ${tree.token.type}.`);
          }
        }
      }
      
      return traverse(parseTree, this._escaper, params);
    }

    /**
     * Get all the columns referenced in the parse tree and return them as an
     * array.  The columns will be distinct (that is, if the same column
     * appears multiple times in the same condition, it will exist in the
     * returned array only once).
     * @param parseTree The parse tree, as created by a ConditionParser.
     */
    getColumns(parseTree) {
      const columns = [];

      // Recursively traverse tree.
      (function traverse(tree, columns) {
        // If the current node is a column and not yet in the list of columns, add it.
        if (tree.token.type === 'column' && columns.indexOf(tree.token.value) === -1)
          columns.push(tree.token.value);

        // Recurse into all children.
        for (let i = 0; i < tree.children.length; ++i)
          traverse(tree.children[i], columns);
      })(parseTree, columns);

      return columns;
    }
  }

  return ConditionCompiler;
}

