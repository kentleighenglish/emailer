/* eslint-disable no-underscore-dangle */
import { string as stringUtils, image as imageUtils } from '@bravissimolabs/utils';

const getFacets = f => {
  const facet = {
    ...f,
    label: f.label || f.name
  };
  if (f.style && f.style.toLowerCase().indexOf('enhanced') >= 0) {
    facet.enhanced = true;
    const style = f.style.toLowerCase().split(' - ').reverse()[0];
    switch (style) {
      case 'checkbox':
        facet.style = 'disc';
        break;
      default:
        facet.style = style;
    }
  } else {
    delete facet.style;
  }
  delete facet.name;
  delete facet._link;
  return facet;
};

/**
 * Transform the raw Contentful items.
 *
 * @param {object} items        Raw Contentful items
 * @param {string} type         Current content type
 *
 * @returns {object}            Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = { ...items };
  results[type] = items[type]
                    .filter(item => item.name && item.slug)
                    .map(item => {
                      const result = {
                        ...item,
                        url: `/collections/${item.slug}/`,
                        reference: stringUtils.labelToReference(item.name),
                        thumbnail: {
                          src: item.thumbnail && item.thumbnail.file
                            ? `${item.thumbnail.file.url}?w=60&h=60&q=80&fit=scale` || ''
                            : '',
                          alt: item.thumbnail && item.thumbnail.file
                            ? item.thumbnail.file.title || item.name
                            : item.name
                        }
                      };
                      if (item.thumbnail && !item.thumbnail.file) {
                        delete result.thumbnail;
                      }
                      if (item.facets) {
                        result.facets = item.facets.map(getFacets);
                      }
                      if (item.subcollections) {
                        result.subcollections = item.subcollections
                                                    .filter(sub => sub.collection);
                        const width = imageUtils.calculateImageWidth(result.subcollections.length);
                        result.subcollections = result
                                                  .subcollections
                                                  .map(sub => {
                                                    const criteria = item.criteria
                                                                         .concat(sub.collection.criteria || []);
                                                    const facets = item.facets
                                                                       .concat(sub.collection.facets || [])
                                                                       .map(getFacets);
                                                    const newSub = {
                                                      ...sub,
                                                      reference: stringUtils.labelToReference(sub.label),
                                                      criteria: Array.from(new Set(criteria)), // Remove duplicates
                                                      facets: Array.from(new Set(facets))
                                                    };
                                                    if (sub.image && sub.image.file && sub.image.file.url) {
                                                      newSub.image = {
                                                        src: `${newSub.image.file.url}?fit=thumb&f=top_left&w=${width}`,
                                                        alt: newSub.label
                                                      };
                                                    } else {
                                                      delete newSub.image;
                                                    }
                                                    delete newSub.collection;
                                                    delete newSub.id;
                                                    delete newSub._link;
                                                    delete newSub._meta;
                                                    delete newSub._type;
                                                    delete newSub.name;
                                                    return newSub;
                                                  });
                      }
                      return result;
                    });
  return results;
};

export default {
  reduceItems
};
