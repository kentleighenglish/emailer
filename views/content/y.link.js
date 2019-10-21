/* eslint no-underscore-dangle: off */
import _ from 'lodash';
import utils from '@bravissimolabs/utils';

const { labelToReference } = utils.string;

/**
 * Check that the link's resource either has a) an url for us to use, or b) enough raw material for us to make one.
 * @param {Object} linkObject
 * @returns {boolean}
 */
function isResourceViable(linkObject = {}) {
  const props = [
    'resource.topicLink',
    'resource.faqLink',
    'resource.question',
    'resource.name',
    'resource.title',
    'resource.slug'
  ];
  let result = false;
  props.forEach(prop => {
    if (_.hasIn(linkObject, prop)) {
      result = true;
    }
  });
  return result;
}

/**
 * Transform the raw Contentful items.
 *
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = {
    ...items
  };
  results[type] = items[type].filter(link =>
  (link.resource && isResourceViable(link)) || (link.url && link.label)).map(item => {
    const helpTopics = results.helpTopic;
    const faqs = results.faq;
    const collections = results.productCollection;
    const newLinkObject = {
      ...item
    };
    // If an action is specified, then this link might not have an URL.
    // Set it to #.
    if (item.action && item.action.trigger && item.action.functionName && !newLinkObject.url) {
      newLinkObject.url = '#';
    }
    if (item.resource && item.resource._link) {
      switch (item.resource._link.type) {
        case 'faq':
          newLinkObject.url = faqs.find(faq => faq.id === item.resource._link.id).faqLink
            || `/help/miscellaneous/${labelToReference(item.resource.question)}/`;
          newLinkObject.label = item.label || item.resource.question;
          break;
        case 'helpTopic':
          newLinkObject.url = helpTopics.find(topic => topic.id === item.resource._link.id).topicLink
            || `/help/${labelToReference(item.resource.name)}/`;
          newLinkObject.label = item.label || item.resource.name;
          break;
        case 'page':
          newLinkObject.url = item.resource.slug;
          newLinkObject.label = item.label || item.resource.title;
          break;
        case 'productCollection': {
          const collection = collections.find(c => c.id === item.resource._link.id);
          newLinkObject.url = collection ? collection.url : undefined;
          newLinkObject.label = item.label || item.resource.name;
          break;
        }
        case 'shop':
          newLinkObject.url = `/shops/${labelToReference(item.resource.name)}/`;
          newLinkObject.label = item.label || item.resource.name;
          break;
        case 'staffProfile':
          newLinkObject.url = `/work-for-us/roles/${labelToReference(item.resource.name)}/`;
          newLinkObject.label = item.label || item.resource.name;
          break;
        case 'vacancy':
          newLinkObject.url = `/work-for-us/vacancies/${labelToReference(item.resource.title)}/`;
          newLinkObject.label = item.label || item.resource.title;
          break;
        case 'fileDownload':
          newLinkObject.url = item.resource.url;
          newLinkObject.label = item.label || item.resource.title;
          break;
        default:
          break;
      }
      delete newLinkObject.resource;
    }
    if (newLinkObject.url && newLinkObject.url.indexOf(':') === -1) {
      // Ensure a leading slash is present, unless this is a fragment (i.e. internal link)
      if (!newLinkObject.url.startsWith('/') && !newLinkObject.url.startsWith('#')) {
        newLinkObject.url = `/${newLinkObject.url}`;
      }
      // Check for a trailing slash in the context of a querystring
      if (newLinkObject.url.indexOf('?') >= 0) {
        newLinkObject.url = newLinkObject.url.replace(/\/\?/, '?').replace(/\?/, '/?');
      }
      // Check for a trailing slash in the context of a fragment
      if (newLinkObject.url.indexOf('#') >= 0 && !newLinkObject.url.startsWith('#')) {
        newLinkObject.url = newLinkObject.url.replace(/\/#/, '#').replace(/#/, '/#');
      }
      // Check for a trailing slash in other contexts
      if (!newLinkObject.url.endsWith('/')
        && newLinkObject.url.indexOf('?') === -1
        && newLinkObject.url.indexOf('#') === -1) {
        newLinkObject.url += '/';
      }
    }
    newLinkObject.url = newLinkObject.url.toLowerCase();
    return newLinkObject;
  }).filter(link => link.url); // Final check to ensure no undefined urls have crept in;
  return results;
};

export default reduceItems;
