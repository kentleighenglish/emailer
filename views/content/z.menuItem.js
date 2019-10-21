/* eslint no-underscore-dangle: off */
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
                    .filter(item => item.type !== 'Link' || item.link)
                    .map(item => {
                      const result = {
                        ...item,
                        reference: stringUtils.labelToReference(item.label),
                        columns: (item.columns || [])
                          .filter(column => column.label)
                          .map(column => ({
                            ...column,
                            reference: stringUtils.labelToReference(column.label),
                            name: column.label
                          })),
                        type: stringUtils.labelToReference(item.type)
                      };
                      if (item.link) {
                        const link = results.link.find(l => l.id === item.link._link.id);
                        if (link) {
                          result.url = link.url || '#';
                        }
                      }
                      delete result.link;
                      return result;
                    });
  return results;
};

export default {
  reduceItems
};
