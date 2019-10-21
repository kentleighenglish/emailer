/**
 * Merge B2 and Contentful shop data.
 *
 * @param {Object} items        Raw Contentful items
 * @param {String} type         Current content type
 *
 * @returns {Object}            Reduced items
 */
export const reduceItems = async (items, type) => {
  const results = { ...items };
  results[type] = items[type].filter(f => f.file && f.file.file)
    .map(item => {
      const result = {
        ...item.file.file,
        filename: item.filename || item.file.file.fileName,
        title: item.file.title,
        id: item.id
      };
      delete result.fileName;
      return result;
    });
  return results;
};

export default {
  reduceItems
};
