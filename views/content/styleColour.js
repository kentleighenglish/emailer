/* eslint-disable no-underscore-dangle */
import { string as stringUtils } from '@bravissimolabs/utils';
import uuid from 'uuid';
import config from 'config';
import isEmpty from 'lodash/isEmpty';
import debugModule from 'debug';
import { getImageUrl } from '../contentUtils';

const debug = debugModule('worker:tasks:REFRESH_CONTENT_FINAL_PROCESS:styleColour');
const PRODUCT_GROUP_VALID_CATEGORIES = ['lingerie', 'swimwear'];
const UNDERWIRED_PRODUCT_GROUPS = ['balconette bra', 'full cup bra',
  'half cup bra', 'plunge bra', 'strapless bra'];
const CM_TO_INCHES = 0.393701;

// Image dimension constants
const DETAIL_WIDTH = 550;
const DETAIL_HEIGHT = 704;
const DETAIL_THUMBNAIL_WIDTH = 135;
const THUMBNAIL_WIDTH = 192;

const onePagePerStyleEnabled = config.productDetails && !!+config.productDetails.onePagePerStyle;

/**
 * @return {string}
 */
function generateId() {
  return uuid.v4().toString().toUpperCase();
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 1028;

/**
 * Get an image object with appropriate fallbacks.
 *
 * @param  {Object} image     Existing image object
 * @param  {Integer} imageWidth    Optional fixed width
 * @param  {Integer} imageHeight   Optional fixed height
 * @param  {Boolean} thumbnail Optional Is the image a thumbnail?
 *
 * @return {{ src: String, alt: String }} - Reduced image object
 */
function getImage(image, imageWidth, imageHeight, thumbnail = false) {
  const needsPlaceholder = !(image && image.file);
  const imageDimensions = (!needsPlaceholder && image.file.details && image.file.details.image) || {};

  const width = imageWidth || imageDimensions.width || DEFAULT_WIDTH;
  const height = imageHeight || imageDimensions.height || DEFAULT_HEIGHT;

  const alt = needsPlaceholder ? 'Awaiting photo' : image.description || '';
  const queryString = `?q=${thumbnail ? '100' : '80'}${width ? `&w=${width}` : ''}`;
  const src = needsPlaceholder
    ? `https://placehold.it/${width}x${height}?text=Awaiting+photo`
    : getImageUrl(image.file.url, width ? { w: width } : {}, queryString);

  return {
    alt,
    height,
    id: generateId(),
    src,
    width
  };
}

/**
 * Takes in a description string and replaces the first cm
 * measurement in the string with an inches measurement
 * @param {string} description
 * @return {string}
 */
const convertCmToIn = description => {
  const measurementRegex = /([0-9]+\.?[0-9]*) ?cm/i;
  const cmMeasurement = description.match(measurementRegex);
  if (cmMeasurement) {
    const inches = Math.round(cmMeasurement[1] * CM_TO_INCHES * 10) / 10;
    return description.replace(measurementRegex, `${inches}in`);
  }
  return description;
};

/**
 * Formats the additional features that come from b2.
 * @param {string} outlet
 * @param {string} category
 * @param {Object} feature
 * @return {string}
 */
function formatAdditionalFeatures(outlet, category, { label, value }) {
  if (value === label || value.match(/^yes$/i)) {
    return label;
  } else if (value.match(/^no$/i)) {
    return null;
  } else if (label.match(/padded/gi)) {
    return value;
  } else if (label.match(/washing instruction/gi)) {
    return category === 'Clothing' ? value : null;
  }
  // Convert cm to inches for US
  let localisedValue;
  if (outlet === 'US') {
    localisedValue = convertCmToIn(value);
  }
  return `${label}: ${localisedValue || value}`;
}

/**
 * Filter helper function to remove empty values
 * @param {any} item
 * @returns {Boolean}
 */
const notEmpty = item => item !== null && item !== undefined && item !== '';

/**
* Merge B2 and CMS fields together into a single list of product details.
*
* @param {Object} contentItem
* @param {Object} styleColour
* @param {string} currentOutlet
*
* @returns {string[]}
*/
function buildAdditionalDetails(contentItem, styleColour, currentOutlet) {
  const {
    additionalDetails = [],
    hideB2ProductDetails
  } = contentItem;
  const {
    hookFastening = [],
    features = [],
    fabricComposition = [],
    productGroup,
    category = ''
  } = styleColour;
  let localisedAdditionalDetails = [...additionalDetails];
  if (currentOutlet === 'US') {
    localisedAdditionalDetails = additionalDetails.map(convertCmToIn);
  }
  if (!hideB2ProductDetails) {
    if (UNDERWIRED_PRODUCT_GROUPS.includes(productGroup.toLowerCase())) {
      localisedAdditionalDetails.unshift(currentOutlet === 'US' ? 'Underwire' : 'Underwired');
    }
    const basicDetails = (productGroup && PRODUCT_GROUP_VALID_CATEGORIES.includes(category.toLowerCase()))
      ? [productGroup].concat(localisedAdditionalDetails)
      : localisedAdditionalDetails;
    const hookFasteningDetails = (
      (Array.isArray(contentItem.hookFastening) && contentItem.hookFastening.filter(notEmpty).length)
        ? contentItem.hookFastening
        : hookFastening
    ).filter(notEmpty);
    const formatForOutlet = formatAdditionalFeatures.bind(null, currentOutlet, category);
    const fabricDetails = fabricComposition
      .map(formatForOutlet)
      .filter(notEmpty);
    const featureDetails = features
      .map(formatForOutlet)
      .filter(notEmpty);
    localisedAdditionalDetails = basicDetails.concat(hookFasteningDetails, fabricDetails, featureDetails);
  }
  if (currentOutlet === 'US') {
    // Add the imported detail required by Federal Trade Commission
    localisedAdditionalDetails = [
      ...localisedAdditionalDetails,
      'Imported'
    ];
  }

  // Add the call-us detail required in https://git.bravissimolabs.com/website/web-platform/issues/2148
  return [
    ...localisedAdditionalDetails,
    'Call-us'
  ];
}

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
 * Transform the raw Contentful items.
 *
 * @param {object} items             Raw Contentful items
 * @param {string} type              Current content type
 * @param {Function} addLinkMapping  Function to add a link mapping
 * @param {Object} db                RethinkDB main instance
 * @param {Object} localeDb          RethinkDB locale database instance
 *
 * @returns {object}                 Reduced items
 */
export const reduceItems = async (items, type, addLinkMapping, { db, localeDb, outlet }) => {
  const results = { ...items };
  const styles = results.style;
  const b2styleColours = await db.runQuery(localeDb.table('staging_styleColour').coerceTo('array'));
  const productCategories = results.productCategory;
  results[type] = [];

  b2styleColours.forEach(sc => {
    const styleColours = items[type].filter(c => c.styleColourId === sc.id && c.status === 'Released');

    // Contentful allows multiple saved entries for styleColours even though the styleColourCode field is set to be
    // unique (this is not an issue in the live environment as it will only let you publish one entry with the same
    // unique key).
    // To combat this, we try and determine which entry to display by assuming that the finished entry will have the
    // most properties.
    const indexToUse = styleColours
      .map((styleColour, index) => ({
        originalIndex: index,
        size: Object.keys(styleColour).length
      }))
      .reduce((previous, current) => (
        (current.size > previous.size ? current : previous)
      ), { originalIndex: -1, size: 0 })
      .originalIndex
    ;

    const item = indexToUse > -1 && styleColours[indexToUse];
    if (styleColours.length > 1) {
      debug(
        `There are ${styleColours.length} style colour entries in Contentful for ${item.code}. ` +
        `Assumed Contentful entry ${item.id} is the correct entry to use.`
      );
    }

    const style = (styles || []).find(c => sc.style && (c.styleId === sc.style.styleId));
    const category = (items.productCategory || []).find(c => c.name && (c.name === sc.category)) || {};
    if (style && item) {
      const styleName = (style && style.name) || (sc.style && sc.style.styleName);
      const slug = onePagePerStyleEnabled
        ? stringUtils.labelToReference(`${sc.colour.colour}-${sc.code}`)
        : stringUtils.labelToReference(`${styleName}-${sc.colour.colour}-${sc.code}`);
      const code = (style.slug || sc.style.styleCode).toLowerCase();
      const isNew = (!!category.currentSeason && (category.currentSeason === sc.launchSeason)) || item.new || false;
      const showInFullPriceSection = !!category.saleMode || !sc.onSale;
      const productCategory = productCategories.find(pc => pc.name === sc.category);
      const containers = {
        // container visible beneath product gallery
        productGalleryContainers: style.productGalleryContainers
          || (productCategory && productCategory.productGalleryContainers)
          || [],
        // container visible beneath tabs
        tabContainers: style.tabContainers || (productCategory && productCategory.tabContainers) || [],
        // container visible beneath size grid
        sizeGridContainers: style.sizeGridContainers
          || (productCategory && productCategory.sizeGridContainers)
          || []
      };

      // Ensure all images have a description
      if (item.mainImage && isEmpty(item.mainImage.description)) {
        item.mainImage.description = item.name;
      }

      if (item.thumbnailImage && isEmpty(item.thumbnailImage.description)) {
        item.thumbnailImage.description = item.name;
      }
      const styleColour = {
        ...sc,
        ...item,
        id: sc.id,
        contentfulId: item.id,
        category: category.label || sc.category,
        colour: {
          ...sc.colour,
          swatch: item.swatchColourCode || sc.colour.swatch
        },
        description: item.description || '',
        displayBrandInProductName: !!category.displayBrandInProductName,
        additionalDetails: buildAdditionalDetails(item, sc, outlet),
        isNew,
        images: {
          listing: getImage(item.mainImage, DETAIL_WIDTH, DETAIL_HEIGHT),
          detail: getImage(item.mainImage, DETAIL_WIDTH, DETAIL_HEIGHT),
          detailThumbnail: getImage(item.mainImage, DETAIL_THUMBNAIL_WIDTH, null, true),
          // Changing the thumbnails to have differing widths will impact the carousel in the product gallery.
          detailThumbnailWidth: DETAIL_THUMBNAIL_WIDTH,
          zoom: getImage(item.mainImage),
          thumbnail: getImage(item.thumbnailImage, THUMBNAIL_WIDTH, null, true),
          additional: (item.additionalImages || []).map(i => ({
            id: generateId(),
            alt: i.description || item.name,
            thumbnail: getImage(i, DETAIL_THUMBNAIL_WIDTH, null, true).src,
            detail: getImage(i, DETAIL_WIDTH, DETAIL_HEIGHT).src,
            zoom: getImage(i).src
          }))
        },
        showInFullPriceSection,
        status: sc.status,
        styleColourName: item.name,
        url: onePagePerStyleEnabled ? `/products/${code}/#${slug}` : `/products/${slug}/`,
        ...containers
      };
      delete styleColour.mainImage;
      delete styleColour.thumbnailImage;
      delete styleColour.additionalImages;
      delete styleColour.name;
      delete styleColour.hideB2ProductDetails;
      delete styleColour.lastRefreshedAt;
      delete styleColour.swatchColourCode;
      delete styleColour.hookFastenings; // These aren't needed now they're part of additionalDetails
      if (styleColour.isAccessory) {
        styleColour.images.listing = styleColour.images.detail;
      }
      if (styleColour.style) {
        styleColour.style.styleName = styleName;
      }
      if (isNew) {
        styleColour.attributes = styleColour.attributes || {};
        styleColour.attributes.new = { label: 'New', modifiers: ['new', 'round'] };
      }

      // Add link mapping back in, as id has changed to the stylecolour id from the item id
      const mapNestedLinks = value => {
        if (typeof value !== 'object' || Array.isArray(value)) {
          return;
        }
        if (value._link) {
          addLinkMapping(value._link.type, value._link.id, type, styleColour.id);
        }
        Object.keys(value).forEach(key => mapNestedLinks(value[key]));
      };
      mapNestedLinks(item);
      results[type].push(styleColour);
    }
  });
  return results;
};

export default {
  reduceItems
};
