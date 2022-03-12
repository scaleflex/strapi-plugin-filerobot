'use strict';

/**
 * scaleflex-filerobot.js controller
 *
 * @description: A set of functions called "actions" of the `scaleflex-filerobot` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },
  getConfig: async (ctx) => {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });
    const config = await pluginStore.get({ key: 'options' });
    ctx.send(config);
  },
  updateConfig: async (ctx) => {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });
    await pluginStore.set({
      key: 'options',
      value: ctx.request.body
    });
    await strapi.config.set('plugins.upload.processorOptions', ctx.request.body);
    const config = await pluginStore.get({ key: 'options' });
    ctx.send(config);
  },
};
