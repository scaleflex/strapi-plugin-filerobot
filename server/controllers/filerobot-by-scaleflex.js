'use strict';

module.exports = {
  async index(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .getWelcomeMessage();
  },
  async getConfig(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .getConfig();
  },
  async updateConfig(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .updateConfig(ctx);
  },
  async checkDbFiles(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .checkDbFiles(ctx);
  },
  async recordFile(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .recordFile(ctx);
  },
  async syncUp(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .syncUp(ctx);
  },
  async getMedia(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .getMedia(ctx);
  },
  async getMediaCount(ctx) {
    ctx.body = await strapi
      .plugin('filerobot-by-scaleflex')
      .service('scaleflexFilerobot')
      .getMediaCount(ctx);
  },
};
