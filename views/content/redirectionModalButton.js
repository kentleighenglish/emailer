/* eslint no-underscore-dangle: off */
import { buttonModifierMap } from './z.button';

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
    const modalButton = {
      ...item,
      linkType: item.linkType || 'Button'
    };
    const mappedModifiers = { ...buttonModifierMap };
    if (item.modifiers) {
      modalButton.modifiers = item.modifiers.map(
        modifier => mappedModifiers[modifier]
      );
    }
    return modalButton;
  });
  return reducedItems;
};

export default reduceItems;
