import camelCase from 'lodash/camelCase';
/* eslint-disable no-underscore-dangle */
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
    const textareaField = {
      ...item,
      fieldType: item._type,
      validation: [],
      modifiers: ['large'],
      floatLabel: true
    };
    if (item.modifiers) {
      item.modifiers.forEach(mod => textareaField.modifiers.push(mod.toLowerCase()));
    }
    if (item.name) {
      textareaField.name = camelCase(item.name.toLowerCase());
    }
    if (item.required) {
      textareaField.validation.push('required');
    }

    delete textareaField._type;
    return textareaField;
  });
  return reducedItems;
};

export default {
  reduceItems
};
