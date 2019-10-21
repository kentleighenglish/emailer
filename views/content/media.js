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
    const media = {
      ...item
    };
    if (item.supportingText) {
      media.content = item.supportingText;
      delete media.supportingText;
    }
    if (item.embed) {
      if (item.embed.mediaLink) {
        media.embed.url = item.embed.mediaLink;
        delete media.embed.mediaLink;
      }
      if (item.embed.sourceLink) {
        media.embed.src = item.embed.sourceLink;
        delete media.embed.sourceLink;
      } else if (media.embed.url) {
        media.embed.src = media.embed.url;
      }
    }
    return media;
  });
  return reducedItems;
};

export default reduceItems;
