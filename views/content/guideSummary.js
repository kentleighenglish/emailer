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
    const guideSummary = {
      ...item,
      label: 'Guide'
    };
    if (item.image && item.image.asset && item.image.asset.file) {
      guideSummary.image.src = item.image.asset.file.url;
    }
    if (item.image && item.image.label) {
      guideSummary.image.alt = item.image.label;
    }

    switch (true) {
      case !!(item.summaryHeading && item.summarySubheading):
        guideSummary.title = [
          { content: item.summaryHeading, style: 'drawn' },
          { content: item.summarySubheading, style: 'cursive' }
        ];
        break;

      case !!item.summaryHeading:
        guideSummary.title = [{ content: item.summaryHeading, style: 'drawn' }];
        break;

      case !!item.summarySubheading:
        guideSummary.title = [{ content: item.summarySubheading, style: 'cursive' }];
        break;

      default:
        guideSummary.title = [];
        break;
    }
    return guideSummary;
  });
  return reducedItems;
};

export default {
  reduceItems
};
