'use strict';

require('insulin').factory('ndm_FromAdapter',
  ['ndm_From'], ndm_FromAdapterProducer);

function ndm_FromAdapterProducer(From) {
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
     * @param {...(object|string)} [cols] - An optional set of columns to select.
     * @return {Select} A Select instance that can be executed.
     */
    select(/*...cols*/) {
      throw new Error('select not implemented.');
    }

    /**
     * Delete from the table.
     * @param {string} [tableAlias] - The unique alias of the table from which
     * records will be deleted.  Optional, defaults to the alias of the from
     * table.
     * @return {Delete} A Delete instance that can be executed.
     */
    delete(/*tableAlias*/) {
      throw new Error('delete not implemented.');
    }

    /**
     * Update a table.
     * @param {Object} model - The model describing what to update.
     * @see Update
     * @return {Update} An Update instance that can be executed.
     */
    update(/*model*/) {
      throw new Error('update not implemented.');
    }
  }

  return FromAdapter;
}

