/* eslint-disable no-unused-vars */

// This is an example task that demonstrates how to manipulate Contentful
// content during the refresh process.

// The table name to use in RethinkDB (optional)
export const tableName = '_example';

/**
 * Configuration for accessing the Rethink databases
 * @typedef {Object} DbConfig
 * @property {Object} localeDb  RethinkDB locale database instance
 * @property {Object} outletDb  RethinkDB outlet database instance
 * @property {Object} commonDb  RethinkDB common database instance
 * @property {Object} db        RethinkDB main instance
 * @property {String} locale    Current locale
 * @property {String} outlet    Current outlet
 */

/**
 * Customise creation of the RethinkDB table. Must handle any checks for the
 * table already existing.
 *
 * @param {Object} db         RethinkDB database instance
 * @param {String} name       Table name to use
 *
 * @returns {Object}          Newly created RethinkDB table
 */
export const createTable = async (db, name) => db.table(name);

/**
 * Transform the raw Contentful items.
 *
 * @param {Object} items             Raw Contentful items
 * @param {String} type              Current content type
 * @param {Function} addLinkMapping  Function to add a link mapping
 * @param {DbConfig} dbConfig        Database config
 *
 * @returns {Object}                 Reduced items
 */
export const reduceItems = async (items, type, addLinkMapping, dbConfig) => items;

/**
 * Manually insert the content into Rethink (optional).
 *
 * @param {Object} db         RethinkDB database instance
 * @param {Object} table      RethinkDB table
 * @param {String} content    Content to be saved
 *
 * @returns {Boolean}         Result of save operation
 */
export const saveContent = async (db, table, content) => true;

export default {
  tableName,
  createTable,
  reduceItems,
  saveContent
};
