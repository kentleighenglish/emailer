/* eslint-disable import/prefer-default-export, no-underscore-dangle */

import _ from 'lodash';
import { string as stringUtils } from '@bravissimolabs/utils';

/**
 * Configuration for accessing the Rethink databases
 * @typedef {Object} DbConfig
 * @property {Object} localeDb  RethinkDB locale database instance
 * @property {Object} outletDb  RethinkDB outlet database instance
 * @property {Object} commonDb  RethinkDB common database instance
 * @property {Object} db        RethinkDB main instance
 * @property {String} locale    Current locale
 * @property {String} outlet    Current outlet
 */

/**
 * Merge B2 and Contentful shop data.
 *
 * @param {Object} items             Raw Contentful items
 * @param {String} type              Current content type
 * @param {Function} addLinkMapping  Current content type
 * @param {DbConfig} dbConfig        Database config
 *
 * @returns {Object}                 Reduced items
 */
export const reduceItems = async (items, type, addLinkMapping, { db, outletDb }) => {
  const results = { ...items };
  const validImage = image => image.asset && image.asset.file && image.asset.file.url;
  const b2shops = await db.runQuery(outletDb.table('shop').coerceTo('array'));
  const settings = (items.settingGroup || []).find(s => s.id === 'shops') || {};
  results[type] = b2shops.reduce((list, shop) => {
    const contentShop = results[type].find(s => shop.id === s.b2id);
    if (contentShop) {
      const localInformation = (contentShop.localInformation || [])
                                .filter(li => li.heading && li.text)
                                .map(li => ({
                                  title: li.heading,
                                  copy: li.text
                                }));
      const title = settings.shopPageTitle || 'Welcome!';
      const name = contentShop.name.trim();
      const result = {
        ...contentShop,
        name,
        allowClickAndCollect: !!shop.allowClickAndCollect,
        localInformation,
        openingTimes: (contentShop.openingTimes || []).map(mapOpeningTime),
        seasonalOpeningTimes: (contentShop.seasonalOpeningTimes || []).map(mapOpeningTime),
        seasonalOpeningTimesEnabled: !!settings.showSeasonalOpeningTimes,
        address: {
          address1: shop.address1,
          address2: contentShop.addressOverride || shop.address2,
          address3: shop.address3,
          town: shop.town,
          region: shop.region,
          postCode: shop.postcode,
          country: shop.country.trim()
        },
        slug: stringUtils.labelToReference(name),
        title,
        welcomeImages: (contentShop.welcomeImages || []).filter(validImage).map(i => mapWelcomeImage(i, title)),
        shortName: shop.shop.replace(' Shop', '')
      };

      if (contentShop.addressOverride) {
        delete result.address.address3;
      }

      delete result.addressOverride;

      if (settings.contactMessage) {
        result.contactMessage = settings.contactMessage;
      }
      list.push(result);
    }
    return list;
  }, []);
  return results;
};


/**
 * Format an openingTime object
 * @param  {Object} ot openingTime
 * @return {Object}    Reshaped object
 */
function mapOpeningTime(ot) {
  return {
    day: ot.label ? ot.label : '',
    times: (ot.openingTime && ot.closingTime) ? _.compact([ot.openingTime, ot.closingTime]).join(' - ') : ''
  };
}

/**
 * Format a welcome image object
 * @param  {Object} welcomeImage image detail
 * @param  {Object} fallbackTitle shop name
 * @return {Object}    Reshaped object
 */
function mapWelcomeImage(welcomeImage, fallbackTitle) {
  return {
    url: `${welcomeImage.asset.file.url}?w=180&h=180`,
    label: welcomeImage.label || fallbackTitle
  };
}

export default {
  reduceItems
};
