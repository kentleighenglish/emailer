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
    const selectField = {
      ...item,
      fieldType: item._type,
      validation: [],
      modifiers: ['large']
    };
    if (item.options) {
      selectField.options = item.options.map(option => ({ label: option, value: option }));
    }
    if (item.modifiers) {
      item.modifiers.forEach(mod => selectField.modifiers.push(mod.toLowerCase()));
    }
    if (item.name) {
      selectField.name = camelCase(item.name.toLowerCase());
    }
    if (item.required) {
      selectField.validation.push('required');
    }

    delete selectField._type;
    return selectField;
  });
  return reducedItems;
};

export default {
  reduceItems
};
