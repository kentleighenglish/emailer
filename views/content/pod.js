const validBackgroundImage = item => !item.backgroundImage ||
(item.backgroundImage.file && item.backgroundImage.file.url);
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
  const textBackgroundOpacityMappings = {
    'Very Light': 0.15,
    Light: 0.25,
    Mid: 0.35,
    Dark: 0.45,
    'Very Dark': 0.55
  };
  reducedItems[type] = items[type].filter(validBackgroundImage).map(item => {
    const pod = {
      ...item,
      styles: {}
    };
    if (item.podAlignment && item.contentAlignment) {
      pod.layout = [item.podAlignment, item.contentAlignment];
    }
    if (item.backgroundColour || item.backgroundImage) {
      if (item.backgroundColour && item.backgroundImage) {
        pod.styles.backgroundColor = item.backgroundColour;
        pod.styles.backgroundImage = `url(${item.backgroundImage.file.url})`;
      } else if (item.backgroundColour) {
        pod.styles.backgroundColor = item.backgroundColour;
      } else {
        pod.styles.backgroundImage = `url(${item.backgroundImage.file.url})`;
      }
    }
    if (item.showBorder) {
      pod.styles.boxShadow = 'inset 0 0 0 1px rgba(70, 67, 63, 0.15)';
    }
    if (item.cutout) {
      pod.cutout = {
        src: item.cutout.asset.file.url,
        alt: item.cutout.label
      };
    }
    if (item.textBackgroundOpacity) {
      pod.textBackgroundOpacity = textBackgroundOpacityMappings[item.textBackgroundOpacity];
    }
    // If there is exactly one action on the pod, make the whole pod clickable
    // and apply styling
    if (item.actions && item.actions.length === 1 && item.actions[0].link) {
      pod.layout = pod.layout || [];
      pod.layout.push('link');
      pod.makeClickable = true;
    }

    if (item.backgroundVideo) {
      delete pod.sizing;
    }

    delete pod.backgroundColour;
    delete pod.backgroundImage;
    delete pod.podAlignment;
    delete pod.contentAlignment;
    delete pod.showBorder;
    return pod;
  });
  return reducedItems;
};

export default {
  reduceItems
};
