/**
 * Ensure no empty style content is saved.
 *
 * @param {Object} items             Raw Contentful items
 * @param {String} type              Current content type
 * @param {Function} addLinkMapping  Function to add a link mapping
 * @param {DbConfig} dbConfig        Database config
 *
 * @returns {Object}                 Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = { ...items };
  results[type] = items[type].filter(item => !!item.code);
  return results;
};

export default {
  reduceItems
};
