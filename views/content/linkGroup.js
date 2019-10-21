import { string as stringUtils } from '@bravissimolabs/utils';

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
                    .filter(item => item.links && item.links.length)
                    .map(item => ({
                      ...item,
                      reference: stringUtils.labelToReference(item.heading || '')
                    }));
  return results;
};

export default {
  reduceItems
};
