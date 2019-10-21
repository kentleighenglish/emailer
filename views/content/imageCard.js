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
    const imageCard = {
      ...item
    };
    if (item.image && item.image.file && item.image.file.url) {
      const { file } = item.image;

      imageCard.image = {
        src: file.url
      };

      // Add the width and height if available
      const height = file.details && file.details.image && file.details.image.height;
      const width = file.details && file.details.image && file.details.image.width;

      if (height && width) {
        imageCard.image.height = height;
        imageCard.image.width = width;
      }
    }

    return imageCard;
  });
  return reducedItems;
};

export default reduceItems;
