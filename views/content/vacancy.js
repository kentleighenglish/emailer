import _ from 'lodash';
import { string as stringUtils } from '@bravissimolabs/utils';

/**
 * Transform the Contentful department items
 *
 * Must be completed after 'settingGroup' and 'shop'
 * @param {object} items - items
 * @param {string} type - 'department'
 * @return {object}
 */
const reduceItems = (items, type) => {
  const jobSettings = (items.settingGroup || []).find(settingGroup => settingGroup.id === 'jobs') || {};

  const isItemValid = item => item.title && item.description && item.department && item.salary && item.contract;

  // eslint-disable-next-line no-underscore-dangle
  const link = object => object._link || {};

  const departmentId = dept => link(dept).id || null;

  const isShop = siteOrShop => link(siteOrShop).type === 'shop';

  const findShop = b2id => items.shop.find(shop => shop.b2id === b2id) || {};

  const shopAddress = shop => {
    const addr = findShop(shop.b2id).address || {};
    return _.compact([addr.address1, addr.address2, addr.address3, addr.town, addr.region, addr.postcode]).join(', ');
  };

  const address = siteOrShop => (
    isShop(siteOrShop) ? shopAddress(siteOrShop) : (siteOrShop.address || '')
  );

  const applicationInfo = (item, email, name, site) => {
    const applicationForm = item.applicationForm || item.department.applicationForm;
    let template = (applicationForm && !item.disableForms
        ? jobSettings.applicationTemplateWithForm
        : jobSettings.applicationTemplate) || '';
    template = template
      .replace('{email}', `[${email}](mailto:${email})`)
      .replace('{name}', name)
      .replace('{address}', address(site))
      ;
    // The text for the form download anchor tag will come down from Contentful wrapped in curly braces i.e.
    // {form:xxx}. We can create a markdown link by square-bracketing the text after 'form:', and appending the file url
    // wrapped in parentheses. If there is no job form then we just return the template as is.
    return applicationForm && applicationForm.file
      ? template.replace(/\{form:([^}]*)\}/, `[$1](${applicationForm.file.url})`)
      : template;
  };

  const location = item => {
    if (item.location) {
      return location;
    }

    if (item.shop) {
      return item.shop.name;
    }

    if (item.department.site && item.department.site.name) {
      return item.department.site.name;
    }

    return null;
  };

  const slugs = new Set();

  const ensureUnique = slug => {
    if (!slugs.has(slug)) {
      slugs.add(slug);
      return slug;
    }

    let index = 1;
    let suffixedSlug;
    do {
      suffixedSlug = `${slug}-${index++}`;
    } while (slugs.has(suffixedSlug));

    slugs.add(suffixedSlug);
    return suffixedSlug;
  };

  const slug = (title, site) => {
    let itemSlug = stringUtils.labelToReference(title);
    if (isShop(site)) {
      const shop = findShop(site.b2id);
      if (shop.slug) {
        itemSlug += `-${shop.slug}`;
      }
    }

    return ensureUnique(itemSlug);
  };

  const departmentIds = (main, additional = []) => [departmentId(main), ...additional.map(id => departmentId(id))];

  const reduceItem = item => {
    const { email, name, site } = item.alternativeContact || item.department.defaultRecruitmentContact || {};

    const vacancy = {
      ...item,
      slug: slug(item.title, site),
      location: location(item),
      departmentIds: departmentIds(item.department, item.additionalDepartments),
      introduction: item.introduction || jobSettings.vacancyIntroduction || null,
      applicationInfo: applicationInfo(item, email, name, site)
    };

    delete vacancy.alternativeContact;
    delete vacancy.department;
    delete vacancy.shop;

    return vacancy;
  };

  return ({
    ...items,
    [type]: items[type].filter(isItemValid).map(reduceItem)
  });
};

export default {
  reduceItems
};
