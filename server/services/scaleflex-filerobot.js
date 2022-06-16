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
  async recordFile(ctx) {
    var file = ctx.request.body.file;
    var action = ctx.request.body.action;

    var url = (action === 'export') ? file.link : file.url.cdn;
    var name = (action === 'export') ? file.file.name : file.name;
    var alt = (action === 'export') ? file.file.uuid : file.uuid;
    var ext = (action === 'export') ? file.file.extension : file.extension;
    var mime = (action === 'export') ? file.file.type : file.type;
    var size = parseFloat( (action === 'export') ? file.file.size.pretty : file.size.pretty );
    var hash = (action === 'export') ? file.file.hash.sha1 : file.hash.sha1;
    var width = (action === 'export') ? file.file.info.img_w : file.info.img_w;
    var height = (action === 'export') ? file.file.info.img_h : file.info.img_h;

    // @Todo: check if already exist in DB (name, url, provider=filerobot)

    await strapi.entityService.create('plugin::upload.file', {
      data: {
        url: url,
        name: name,
        caption: name,
        alternativeText: alt,
        provider: 'filerobot',
        ext: `.${ext}`,
        mime: mime,
        size: size,
        hash: hash,
        width: width,
        height: height, 
        // @Todo: get current user id too
      },
    });
  },
});
