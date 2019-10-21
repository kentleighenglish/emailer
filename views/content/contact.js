/**
 * Merge B2 and Contentful shop data.
 *
 * @param {Object} items        Raw Contentful items
 * @param {String} type         Current content type
 *
 * @returns {Object}            Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = { ...items };
  results[type] = items[type].filter(c => c.name)
    .map(contact => {
      const result = {
        ...contact
      };
      return result;
    });
  return results;
};

export default {
  reduceItems
};
