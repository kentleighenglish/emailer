/* eslint-disable no-underscore-dangle */
const pageMapper = page => ({
  label: page.title ? page.title : page._link.title,
  id: page.id ? page.id : page._link.id,
  url: page.slug ? `/${page.slug}/` : `/${page._link.slug}/`
});

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
    const pages = items[type];
    const page = {
      ...item
    };
    if (item.pages && item.pages.length) {
      page.children = item.pages.map(p => pageMapper(p, pages));
    }
    const parent = pages.find(parentPage => parentPage.pages && parentPage.pages.find(p => item.id === p._link.id));
    if (parent) {
      page.parentId = parent.id;
    }
    delete page.pages;
    return page;
  });
  return reducedItems;
};

export default {
  reduceItems
};
