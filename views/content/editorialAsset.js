import { getImageUrl } from '../contentUtils';

/**
 * @param {Object} asset
 * @returns {Object}
 */
export const getImagePropsFromAsset = asset => {
  const { file: { details: { image = '' } = {}, url } } = asset;

  if (!image) {
    return {};
  }

  return {
    height: image.height,
    src: getImageUrl(url),
    width: image.width
  };
};

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
    let editorialAsset = {
      ...item
    };
    if (item.asset && item.asset.file) {
      editorialAsset = {
        ...editorialAsset,
        ...getImagePropsFromAsset(item.asset)
      };
    }
    if (item.assetMobile && item.assetMobile.file) {
      editorialAsset.smallScreen = getImagePropsFromAsset(item.assetMobile);
    }
    delete editorialAsset.asset;
    return editorialAsset;
  });
  return reducedItems;
};

export default {
  reduceItems
};
