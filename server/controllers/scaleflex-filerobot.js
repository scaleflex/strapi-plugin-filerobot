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
  async checkDbFiles(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .checkDbFiles(ctx);
  },
  async recordFile(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .recordFile(ctx);
  },
  async syncUp(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .syncUp(ctx);
  },
  async getMedia(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .getMedia(ctx);
  },
};
