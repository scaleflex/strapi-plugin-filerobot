'use strict';

module.exports = {
  async index(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .getWelcomeMessage();
  },
  async getConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .getConfig();
  },
  async updateConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .updateConfig(ctx);
  },
};
