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
    const uploadField = {
      ...item,
      fieldType: item._type,
      validation: []
    };
    if (item.name) {
      uploadField.name = camelCase(item.name.toLowerCase());
    }
    if (item.required) {
      uploadField.validation.push('required');
    }

    delete uploadField._type;
    return uploadField;
  });
  return reducedItems;
};

export default {
  reduceItems
};
