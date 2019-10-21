const validImage = item => !item.image || (item.image.asset && item.image.asset.file && item.image.asset.file.url);

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
  reducedItems[type] = items[type].filter(item => validImage(item)).map(item => {
    const channel = {
      ...item
    };
    if (item.image) {
      channel.img = {
        src: item.image.asset.file.url,
        alt: item.image.asset.title || item.title
      };
    }
    return channel;
  });
  return reducedItems;
};

export default reduceItems;
