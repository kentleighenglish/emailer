/* eslint no-underscore-dangle: off */

/**
 * Transform the raw Contentful items.
 *
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = { ...items };
  results[type] = items[type]
                    .filter(item => item.collections && item.collections.length)
                    .map(item => ({
                      ...item,
                      collections: item.collections.map(child => {
                        const col = results.productCollection.find(c => c.id === child._link.id);
                        const result = {
                          id: col.id,
                          reference: col.reference,
                          name: col.name,
                          url: col.url
                        };
                        return result;
                      })
                    }));
  return results;
};

export default {
  reduceItems
};
