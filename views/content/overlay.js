import request from 'request-promise';

const SVG_CONTENT_TYPE = 'image/svg+xml';

/**
 * Save the raw SVG contents in the DB.
 * If the overlay asset is not an SVG then do not attempt to save it, as we cannot be confident it will render
 * correctly on the Overlay component.
 *
 * @param {Object} items
 * @param {String} type
 * @returns {Object}
 */
export const reduceItems = async (items, type) => {
  const reducedItems = { ...items };

  await Promise.all(items[type].map(async (item, index) => {
    const itemWithSVG = { ...item };
    const asset = item && item.overlay && item.overlay.file;

    switch (true) {
      case !asset:
      case asset.contentType !== SVG_CONTENT_TYPE:
        delete itemWithSVG.overlay;
        break;

      default: {
        try {
          itemWithSVG.overlay = await request(`https:${asset.url}`);
        } catch (error) {
          delete itemWithSVG.overlay;
        }
      }
    }

    reducedItems[type][index] = itemWithSVG;
  }));

  return reducedItems;
};

export default reduceItems;
