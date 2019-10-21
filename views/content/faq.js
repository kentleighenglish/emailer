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
export const reduceItems = async (items, type) => {
  const reducedItems = {
    ...items
  };
  reducedItems[type] = items[type].map(item => {
    const faq = {
      ...item
    };
    if (item.question) {
      const helpTopic = items.helpTopic
        .filter(topic => topic.faqs && topic.faqs.length)
        .find(topic => topic.faqs.find(f => f.question === item.question));
      if (helpTopic) {
        faq.faqLink = faq.url || `/help/${labelToReference(helpTopic.name)}/#${labelToReference(item.question)}/`;
      } else {
        faq.faqLink = `/help/miscellaneous/${labelToReference(item.question)}/`;
      }
    }
    return faq;
  });
  return reducedItems;
};

export default reduceItems;
