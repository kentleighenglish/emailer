/**
 * Transform the Contentful department items
 *
 * Must be completed after 'settingGroup' and 'shop'
 * @param {object} items - items
 * @param {string} type - 'department'
 * @return {object}
 */
const reduceItems = (items, type) => {
  const jobSettings = (items.settingGroup || []).find(settingGroup => settingGroup.id === 'jobs') || {};

  const isItemValid = item => item.name && item.description;

  // eslint-disable-next-line no-underscore-dangle
  const link = object => object._link || {};

  const itemSequence = item => {
    const index = (jobSettings.departments || []).findIndex(i => link(i).id === item.id);
    return index >= 0 ? index : 1e3;
  };

  const reduceItem = item => ({
    ...item,
    sequence: itemSequence(item)
  });

  return ({
    ...items,
    [type]: items[type].filter(isItemValid).map(reduceItem)
  });
};

export default {
  reduceItems
};
