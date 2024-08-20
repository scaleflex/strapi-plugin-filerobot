'use strict';

module.exports = {
  async index(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .getWelcomeMessage();
  },
  async getConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .getConfig();
  },
  async updateConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .updateConfig(ctx);
  },
  async checkDbFiles(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .checkDbFiles(ctx);
  },
  async recordFile(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .recordFile(ctx);
  },
  async syncUp(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .syncUp(ctx);
  },
  async getMedia(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .getMedia(ctx);
  },
  async getMediaCount(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('scaleflexDAM')
      .getMediaCount(ctx);
  },
};
