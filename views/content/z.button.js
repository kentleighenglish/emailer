/* eslint no-underscore-dangle: off */

export const buttonModifierMap = {
  Small: 'small',
  Large: 'large',
  Cranberry: 'major',
  Green: 'primary',
  Grey: 'minor',
  'Cranberry (filled)': 'major-filled',
  'Grey (filled)': 'minor-filled',
  'Mint (filled)': 'filled',
  'White (filled)': 'white-filled',
  'Underlined Link': 'underlined'
};

const buttonOpacityMap = {
  'Very Light': 'very-light',
  Light: 'light',
  Mid: 'mid',
  Dark: 'dark',
  'Very Dark': 'very-dark'
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
  reducedItems[type] = items[type].filter(i => i.link && i.link._link && i.link._link.id).map(item => {
    const button = {
      ...item
    };
    const mappedModifiers = { ...buttonModifierMap };
    const mappedOpacity = { ...buttonOpacityMap };
    const links = reducedItems.link;
    const currentLink = links.find(l => l.id === item.link._link.id);
    if (currentLink) {
      button.url = currentLink.url;
      button.label = item.label || currentLink.label;
    }
    if (item.modifiers) {
      button.modifiers = item.modifiers
        .filter(modifier => !!mappedModifiers[modifier])
        .map(modifier => mappedModifiers[modifier]);
    }
    if (item.opacity) {
      button.modifiers = button.modifiers || [];
      button.modifiers.push(mappedOpacity[item.opacity]);
    }
    return button;
  });
  return reducedItems;
};

export default reduceItems;
