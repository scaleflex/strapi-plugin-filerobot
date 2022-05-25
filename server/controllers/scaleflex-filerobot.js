'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .getWelcomeMessage();
  },
  getConfig(ctx) {
    ctx.body = strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .getConfig();
  },
  updateConfig(ctx) {
    ctx.body = strapi
      .plugin('scaleflex-filerobot')
      .service('scaleflexFilerobot')
      .updateConfig(ctx);
  },
};
