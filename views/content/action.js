// More should be added as we need them
const SUPPORTED_EVENTS = ['Click'];

const isValidTrigger = trigger => SUPPORTED_EVENTS.indexOf(trigger) > -1;

export const reduceItems = (items, type) => {
  const results = {
    ...items
  };
  results[type] = items[type].filter(({ trigger }) => isValidTrigger(trigger));
  return results;
};

export default reduceItems;
