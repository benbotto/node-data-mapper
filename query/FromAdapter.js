'use strict';

require('insulin').factory('ndm_FromAdapter',
  ['ndm_From', 'ndm_Select', 'ndm_Update', 'ndm_Delete'],
  ndm_FromAdapterProducer);

function ndm_FromAdapterProducer(From, Select, Update, Delete) {
  /**
   * This is an adapter for the From class that provides the user with a
   * convenient interface for selecting, deleting, and updating, all of which
   * are queries that operate on a From instance.
   * @extends From
   */
  class FromAdapter extends From {
    /**
     * Select from the table.
     * @see Select#select
     * @param {...(object|string)=} cols - An optional set of columns to select.
     * @return {Select} A Select instance that can be executed.
     */
    select(...cols) {
      const sel = new Select(this, this._queryExecuter);

      // This has to be applied because cols is optional.  If cols is not passed,
      // calling sel.select(cols) would pass undefined to select().
      return sel.select.apply(sel, cols);
    }

    /**
     * Delete from the table.
     * @param {string} tableAlias - The unique alias of the table from which
     * records will be deleted.  Optional, defaults to the alias of the from
     * table.
     * @return {Delete} A Delete instance that can be executed.
     */
    delete(tableAlias) {
      return new Delete(this, tableAlias);
    }

    /**
     * Update a table.
     * @param {object} model - The model describing what to update.
     * @see Update
     * @return {Update} An Update instance that can be executed.
     */
    update(model) {
      return new Update(this, model);
    }
  }

  return FromAdapter;
}

