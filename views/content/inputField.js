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

  const typeMap = {
    Email: 'email',
    Number: 'number',
    Telephone: 'tel',
    Text: 'text',
    Url: 'url'
  };

  reducedItems[type] = items[type].map(item => {
    const inputField = {
      ...item,
      fieldType: item._type,
      validation: [],
      floatLabel: true,
      modifiers: ['large']
    };

    if (item.name) {
      inputField.name = camelCase(item.name.toLowerCase());
    }

    if (item.type) {
      inputField.type = typeMap[item.type];
      switch (true) {
        case inputField.type === 'tel':
          inputField.validation.push('tel');
          break;
        case inputField.type === 'email':
          inputField.validation.push('email');
          break;
        default:
          break;
      }
    }
    if (item.required) {
      inputField.validation.push('required');
    }
    if (item.modifiers) {
      item.modifiers.forEach(m => inputField.modifiers.push(m.toLowerCase()));
    }
    delete inputField._type;
    return inputField;
  });
  return reducedItems;
};

export default {
  reduceItems
};
