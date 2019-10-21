/* eslint-disable import/prefer-default-export */

/**
 * Transform the raw Contentful items.
 *
 * @param {Object} items             Raw Contentful items
 * @param {String} type              Current content type
 * @param {Function} addLinkMapping  Function to add a link mapping
 *
 * @returns {object}                 Reduced items
 */
export const reduceItems = async (items, type, addLinkMapping) => {
  const results = { ...items };
  results[type] = items[type].filter(s => s.reference).map(item => {
    const settings = (item.settings || [])
      .filter(s => s.reference && s.type)
      .map((setting, orderNumber) => ({ ...setting, orderNumber }))
      .reduce((prev, cur) => {
        let value;
        let isContent;
        switch (cur.type) {
          case 'Text':
            value = cur.textValue || '';
            break;
          case 'Rich Text':
            value = cur.richTextValue || '';
            break;
          case 'Numeric':
            value = cur.numericValue || 0;
            break;
          case 'Boolean':
            value = !!cur.booleanValue;
            break;
          case 'Date':
            value = cur.dateValue || new Date(0).toISOString();
            break;
          case 'File':
            value = cur.fileValue || {};
            value.orderNumber = cur.orderNumber;
            break;
          case 'Content':
            value = cur.contentValue || {};
            value.orderNumber = cur.orderNumber;
            isContent = true;
            break;
          default:
            value = '';
        }
        try {
          // eslint-disable-next-line no-param-reassign
          prev[cur.reference] = value;
          if (isContent) {
            value.forEach(({ _link: link }) => {
              addLinkMapping(link.type, link.id, type, item.reference);
            });
          }
        } catch (ex) {
          // Do nothing
        }
        return prev;
      }, {});
    const settingGroup = {
      _meta: item._meta, // eslint-disable-line no-underscore-dangle
      contentfulId: item.id,
      id: item.reference,
      ...settings
    };

    if (item.saveRevisions) {
      settingGroup.saveRevisions = true;
    }

    return settingGroup;
  });
  return results;
};

export default {
  reduceItems
};
