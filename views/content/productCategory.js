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
  const settings = (items.settingGroup || []).find(s => s.id === 'products') || {};
  results[type] = items[type]
                    .filter(item => item.name && item.b2id)
                    .map(item => {
                      const result = {
                        ...item,
                        label: item.label || item.name,
                        currentSeason: settings.currentSeason || item.currentSeason,
                        saleMode: settings.saleMode || item.saleMode || false,
                        availabilityThresholds: {
                          fullPrice: {
                            percentageLow: item.fullPriceAvailabilityThresholdLow,
                            percentageHigh: item.fullPriceAvailabilityThresholdHigh
                          },
                          sale: {
                            percentageLow: item.saleAvailabilityThresholdLow,
                            percentageHigh: item.saleAvailabilityThresholdHigh
                          }
                        }
                      };

                      if (item.sizeGuideUrl) {
                        result.sizeGuideUrl = {
                          slug: item.sizeGuideUrl.slug
                        };
                      }

                      delete result.fullPriceAvailabilityThresholdHigh;
                      delete result.fullPriceAvailabilityThresholdLow;
                      delete result.saleAvailabilityThresholdHigh;
                      delete result.saleAvailabilityThresholdLow;
                      return result;
                    });
  return results;
};

export default {
  reduceItems
};
