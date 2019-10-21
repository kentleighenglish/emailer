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
    const banner = { ...item };

    if (Array.isArray(banner.contentBlock) && banner.contentBlock.length) {
      banner.contentBlock = banner.contentBlock[0];
    }

    if (Array.isArray(banner.image) && banner.image.length) {
      banner.image = banner.image[0];
    }

    banner.text = {
      desktop: banner.desktopText || null,
      mobile: banner.mobileText || null,
      tablet: banner.tabletText || null
    };

    delete banner.desktopText;
    delete banner.mobileText;
    delete banner.tabletText;

    return banner;
  });
  return reducedItems;
};

export default reduceItems;
