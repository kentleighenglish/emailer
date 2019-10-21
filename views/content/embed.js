import debugModule from 'debug';
import request from 'request-promise';

const debug = debugModule('worker:embed');

const VIMEO_API_BASE_URL = 'https://vimeo.com/api/oembed.json';
const vimeoProps = {
  width: 'width',
  height: 'height',
  html: 'iframe',
  thumbnail_url: 'thumbnail'
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
  const reducedItems = {
    ...items
  };
  reducedItems[type] = await Promise.all(items[type].map(async item => {
    const embed = {
      ...item
    };
    embed.url = item.mediaLink;
    if (item.sourceLink) {
      embed.src = item.sourceLink;
    }
    if (item.videoType === 'vimeo') {
      // Get embedding data and thumbnail from Vimeo
      const options = item.videoOptions || [];
      const queryParams = [`url=${item.mediaLink}`, ...options];
      let embedData;
      try {
        embedData = await request({
          url: `${VIMEO_API_BASE_URL}?${queryParams.join('&')}`,
          method: 'GET'
        });
      } catch (err) {
        debug(`Error getting vimeo data for url ${item.mediaLink}`);
      }
      if (embedData) {
        const jsonData = JSON.parse(embedData);
        // Copy the embed data we want from vimeo embed api, and update prop names
        Object.keys(vimeoProps).forEach(prop => {
          if (jsonData[prop]) {
            embed[vimeoProps[prop]] = jsonData[prop];
          }
        });
        // Pull the iFrame element out of the string that vimeo return
        const iframeString = embed.iframe.match(/<iframe[^>]*><\/iframe>/);
        // Format the iFrame for displaying in React
        embed.iframe = { __html: iframeString ? iframeString[0] : '' };
      }
    }
    if (item.videoType === 'youtube') {
      const options = (item.videoOptions || []).reduce((obj, option) => {
        const propAndValue = option.split('=');
        return {
          ...obj,
          [propAndValue[0]]: propAndValue[1]
        };
      }, {});
      // To prevent non-Bravissimo content appearing in the suggested videos after the clip has finished
      // playing, we add rel=0 to the query string which disables suggested videos entirely.
      embed.src = item.mediaLink.includes('?') ? `${item.mediaLink}&rel=0` : `${item.mediaLink}?rel=0`;
      // Custom defaults included to avoid the browser defaults which, in Chrome,
      // are only 300 x 150
      embed.width = parseInt(options.width, 10) || 560;
      embed.height = parseInt(options.height, 10) || 315;
    }
    delete embed.videoType;
    delete embed.videoOptions;
    delete embed.sourceLink;
    delete embed.mediaLink;
    return embed.src || embed.iframe ? embed : null;
  }));
  reducedItems[type] = reducedItems[type].filter(item => item);
  return reducedItems;
};

export default reduceItems;

/*
Example Vimeo API response:
{
  "type": "video",
  "version": "1.0",
  "provider_name": "Vimeo",
  "provider_url": "https:\/\/vimeo.com\/",
  "title": "test_product_compressed",
  "author_name": "Ivey Topaz",
  "author_url": "https:\/\/vimeo.com\/user69542386",
  "is_plus": "0",
  "account_type": "basic",
  "html": "<iframe
    src=\"https:\/\/player.vimeo.com\/video\/228790971?title=0&byline=0&portrait=0&autoplay=1\"
    width=\"640\" height=\"820\" frameborder=\"0\" title=\"test_product_compressed\"
    webkitallowfullscreen mozallowfullscreen allowfullscreen><\/iframe>",
  "width": 640,
  "height": 820,
  "duration": 8,
  "description": "Test swimwear video",
  "thumbnail_url": "https:\/\/i.vimeocdn.com\/video\/648933125_640.webp",
  "thumbnail_width": 640,
  "thumbnail_height": 820,
  "thumbnail_url_with_play_button": "https:\/\/i.vimeocdn.com\/filter\/overlay?src0=https%3A%2F%2Fi.vimeocdn.com
    %2Fvideo%2F648933125_640.webp&src1=http%3A%2F%2Ff.vimeocdn.com%2Fp%2Fimages%2Fcrawler_play.png",
  "upload_date": "2017-08-08 05:50:46",
  "video_id": 228790971,
  "uri": "\/videos\/228790971"
} */

