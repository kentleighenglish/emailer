import { backgroundScrimFormatter, opacitiesMap } from '../contentUtils';
import { getImagePropsFromAsset } from './editorialAsset';

/**
 * Function for creating layout class names to be consumed by the HeroPod component
 * @param {Array} layout
 * @param {string} sizePrefix (either 'sm', 'md' or 'lg')
 * @returns {Array}
 */
function layoutMapper(layout = [], sizePrefix) {
  return layout.map(val => `${sizePrefix}-content-${val}`);
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
  const reducedItems = {
    ...items
  };
  reducedItems[type] = items[type].map(item => {
    const heroPod = {
      ...item
    };

    const {
      contentBackgroundColour: backgroundColour,
      contentBackgroundOpacity: backgroundOpacity
    } = item;

    if (item.contentBackgroundColour) {
      heroPod.contentBackground = backgroundScrimFormatter(backgroundColour, opacitiesMap[backgroundOpacity]);
    }

    const screenSizes = ['desktop', 'tablet', 'mobile'];
    screenSizes.forEach(screenSize => {
      const key = `${screenSize}BackgroundImage`;
      const asset = item[key];

      if (asset) {
        heroPod[key] = getImagePropsFromAsset(asset);
      }
    });

    heroPod.layout = [
      ...layoutMapper(item.mobileContentPosition, 'sm'),
      ...layoutMapper(item.tabletContentPosition, 'md'),
      ...layoutMapper(item.desktopContentPosition, 'lg')
    ];

    delete heroPod.desktopContentPosition;
    delete heroPod.tabletContentPosition;
    delete heroPod.mobileContentPosition;
    delete heroPod.contentBackgroundColour;
    delete heroPod.contentBackgroundOpacity;

    return heroPod;
  });
  return reducedItems;
};

export default reduceItems;
