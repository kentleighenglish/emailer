import { string as stringUtils } from '@bravissimolabs/utils';

/**
 * Transform the Contentful staffProfile items
 *
 * Must be completed after 'settingGroup'
 * @param {object} items - items
 * @param {string} type - 'staffProfile'
 * @return {object}
 */
const reduceItems = (items, type) => {
  const jobSettings = (items.settingGroup || []).find(s => s.id === 'jobs') || {};

  const isItemValid = item => item.name && item.role && item.roleDescription;

  const itemSequence = item => {
    // eslint-disable-next-line no-underscore-dangle
    const index = (jobSettings.profiles || []).findIndex(i => i._link && i._link.id === item.id);
    return index >= 0 ? index : 1e3;
  };

  const reduceItem = item => {
    const staffProfile = {
      photo: { asset: { file: {} } },
      ...item
    };

    const photo = staffProfile.photo.asset.file.url;

    Object.assign(staffProfile, {
      slug: stringUtils.labelToReference(staffProfile.name),
      sequence: itemSequence(item),
      image: photo ? `${photo}?w=240&h=240` : '//placehold.it/240x240',
      thumbnail: photo ? `${photo}?w=48&h=48` : '//placehold.it/48x48'
    });

    delete staffProfile.photo;

    return staffProfile;
  };

  return ({
    ...items,
    [type]: items[type].filter(isItemValid).map(reduceItem)
  });
};

export default {
  reduceItems
};
