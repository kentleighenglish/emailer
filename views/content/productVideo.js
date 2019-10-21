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
    let embed;
    if (item.video) {
      embed = items.embed.find(video => video.id === item.video._link.id);
      if (embed.thumbnail) {
        // Ensure thumbnail provided by vimeo is correct size for PDP
        embed.thumbnail = embed.thumbnail.replace(/(_)\d{2,4}x\d{2,4}(\.)/, '$1135x173$2');
      }
    }
    // Gather the data from the embeded video, overwriting the thumbnail, id,
    // and title with the data on the product video
    const productVideo = {
      ...embed,
      ...item
    };
    delete productVideo.video;
    return embed ? productVideo : null;
  }).filter(item => item);

  return reducedItems;
};

export default reduceItems;
