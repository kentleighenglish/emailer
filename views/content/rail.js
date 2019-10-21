const STYLE_COLOUR = 'styleColour';
const PRODUCT_SUMMARY_TYPE = 'productSummary';

/**
 * This will convert any style colours stored in the rail's items and convert the content
 * into a product summary content type.
 *
 * Use id instead of code for *much* quicker lookups when shaping the data on the way out.
 *
 * @param {Object} item - from Contentful
 * @returns {*}
 */
const mapStyleColoursToProductSummary = item => {
  // eslint-disable-next-line no-underscore-dangle
  if (item._link && item._link.type !== STYLE_COLOUR) {
    return item;
  }

  // Only return the id.
  // Data will be shaped on the way out.
  return {
    _type: PRODUCT_SUMMARY_TYPE,
    id: item.styleColourId
  };
};

/**
 * @param {Object} rail
 * @returns {*}
 */
const mapRail = rail => ({
  ...rail,
  items: (rail.items || []).map(mapStyleColoursToProductSummary)
});

/**
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */
export const reduceItems = async (items, type) => ({
  ...items,
  [type]: (items[type] || []).map(mapRail)
});

export default reduceItems;
