'use strict';

module.exports = ({ strapi }) => ({
  getWelcomeMessage() {
    return 'Thank you for using Scaleflex Filerobot';
  },
  getConfig() {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });
    const config = pluginStore.get({ key: 'options' });

    if (Object.keys(config).length === 0) {
      return {
        token: '',
        sec_temp: '',
        folder: '',
        fr_url: '',
        user: '',
        pass: ''
      };
    } else {
      return config;
    }
  },
  async updateConfig(ctx) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });
    await pluginStore.set({
      key: 'options',
      value: ctx.request.body
    });
    const config = await pluginStore.get({ key: 'options' });//@Todo: Make this work correctly

    return config;
  },
});
