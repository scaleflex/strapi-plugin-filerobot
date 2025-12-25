import { PLUGIN_ID } from '../pluginId';

const getTranslation = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    acc[`${PLUGIN_ID}.${key}`] = data[key];
    return acc;
  }, {});
};

export { getTranslation };
