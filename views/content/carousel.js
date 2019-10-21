/**
 * Transform the raw Contentful items.
 *
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */

export const reduceItems = async (items, type) => {
  const reducedItems = {
    ...items
  };
  reducedItems[type] = items[type].map(item => {
    const carousel = {
      ...item,
      slidesToShow: item.slidesToShow || 1
    };

    return carousel;
  });
  return reducedItems;
};

export default reduceItems;
