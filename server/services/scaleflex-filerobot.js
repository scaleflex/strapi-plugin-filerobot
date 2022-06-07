'use strict';

module.exports = ({ strapi }) => ({
  getWelcomeMessage() {
    return 'Thank you for using Scaleflex Filerobot';
  },
  async getConfig() {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });

    const config = await pluginStore.get({ key: 'options' });

    if (Object.keys(config).length === 0) {
      return {
        token: '',
        sec_temp: '',
        folder: '',
        fr_url: 1,
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

    const config = await pluginStore.get({ key: 'options' });

    return config;
  },
  async checkDbFiles() {
    var filerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
      filters: {
        $not: {
          provider: 'filerobot',
        },
      },
      populate: { category: true },
    });
    
    var nonFilerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
      filters: {
        provider: 'filerobot',
      },
      populate: { category: true },
    });

    var media = {
      filerobot: filerobotMedia,
      nonFilerobot: nonFilerobotMedia
    };
    
    return media;
  },
});
