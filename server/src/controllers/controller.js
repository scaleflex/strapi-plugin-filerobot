const controller = ({ strapi }) => ({
  async index(ctx) {
    ctx.body = strapi
      .plugin('scaleflex-dam')
      .service('service')
      .getWelcomeMessage();
  },
  async getConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .getConfig();
  },
  async updateConfig(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .updateConfig(ctx);
  },
  async checkDbFiles(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .checkDbFiles(ctx);
  },
  async recordFile(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .recordFile(ctx);
  },
  async syncUp(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .syncUp(ctx);
  },
  async getMedia(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .getMedia(ctx);
  },
  async getMediaCount(ctx) {
    ctx.body = await strapi
      .plugin('scaleflex-dam')
      .service('service')
      .getMediaCount(ctx);
  },
});

export default controller;
