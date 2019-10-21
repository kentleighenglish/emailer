import camelCase from 'lodash/camelCase';
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
  reducedItems[type] = items[type].filter(form => form.title).map(item => {
    const form = {
      ...item,
      formConfig: {
        form: camelCase(item.title)
      },
      formKey: item.id
    };
    if (!item.subject) {
      form.subject = `${item.title}: Form submission`;
    }
    if (item.formFields) {
      form.formConfig.fields = item.formFields.filter(formField => formField.name)
        .map(formField => camelCase(formField.name.toLowerCase()));
    }
    return form;
  });

  return reducedItems;
};

export default {
  reduceItems
};
