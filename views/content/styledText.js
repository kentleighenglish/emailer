import has from 'lodash/has';

const templateFields = [
  'colour',
  'size',
  'font',
  'letterSpacing'
];
/**
 * Checks an item for a template object that has the required properties. No template is ok and can go through.
 * @param {Object} item
 * @return {Boolean}
 */
const hasTemplate = item => !(item.template && has(item.template, templateFields));

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
  reducedItems[type] = items[type].filter(hasTemplate).map(item => {
    const fonts = {
      Wendy: 'cursive',
      // TODO: Lunchbox Slab will be coming out of Contentful eventually. Refactor once it has been safely removed
      'Lunchbox Slab': 'drawn',
      Lunchbox: 'drawn',
      Bliss: 'block',
      Abril: 'smart',
      'Born Ready': 'handwritten'
    };
    const styledText = {
      ...item,
      color: '#46433f'
    };
    if (item.text) styledText.content = item.text;
    if (!item.template) {
      if (item.font && fonts[item.font]) styledText.style = fonts[item.font];
      if (item.colour) styledText.color = item.colour;
      if (item.letterSpacing) styledText.letterSpacing = item.letterSpacing;
      if (item.modifiers) {
        styledText.modifiers = item.modifiers.map(modifier => modifier.toLowerCase());
      }
    } else {
      styledText.style = fonts[item.template.font];
      styledText.color = item.template.colour;
      styledText.size = item.template.size;
      if (item.template.letterSpacing) styledText.letterSpacing = item.template.letterSpacing;
      if (item.template.modifiers) {
        styledText.modifiers = item.template.modifiers.map(modifier => modifier.toLowerCase());
      }
    }
    delete styledText.font;
    delete styledText.colour;
    delete styledText.template;
    delete styledText.text;
    return styledText;
  });
  return reducedItems;
};

export default {
  reduceItems
};
