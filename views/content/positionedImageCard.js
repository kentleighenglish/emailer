/* eslint-disable no-underscore-dangle */
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
    const positionedImageCard = {
      ...item
    };

    delete positionedImageCard.name;
    delete positionedImageCard._type;
    delete positionedImageCard._meta;

    return positionedImageCard;
  });
  return reducedItems;
};

export default reduceItems;
