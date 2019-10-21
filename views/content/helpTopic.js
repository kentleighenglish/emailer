import utils from '@bravissimolabs/utils';

const { labelToReference } = utils.string;
/**
 * Transform the raw Contentful items.
 *
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */
const reduceItems = async (items, type) => {
  const reducedItems = {
    ...items
  };
  reducedItems[type] = items[type].filter(item => item.name && item.faqs).map(item => ({
    ...item,
    topicLink: `/help/${labelToReference(item.name)}/`,
    allFaqs: item.faqs.length
  }));
  return reducedItems;
};

export default {
  reduceItems
};
