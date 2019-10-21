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
  reducedItems[type] = items[type].filter(container => container.type && container.title).map((item, index) => {
    const container = {
      ...item
    };
    if (item.type) {
      switch (item.type) {
        case 'Block':
        case 'Bustier':
        case 'GuideSummary':
        case 'Image':
        case 'Mixed':
        case 'Pod':
        case 'Voice':
          container.type = 'Block';
          break;
        default:
          container.type = item.type;
          break;
      }
    }
    container.slug = item.title ? labelToReference(item.title) : `container-${index}`;
    return container;
  });
  return reducedItems;
};

export default {
  reduceItems
};
