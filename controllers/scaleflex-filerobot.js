'use strict';

// Strapi 3 DB access: https://strapi.gitee.io/documentation/v3.x/concepts/queries.html

module.exports = {
  index: async (ctx) => {
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
  checkDbFiles: async (ctx) => {
    var filerobotMedia = await strapi.query('file', 'upload').find({provider: 'filerobot'});
    var nonFilerobotMedia = await strapi.query('file', 'upload').find({provider_ne: 'filerobot'});

    var media = {
      filerobot: filerobotMedia,
      nonFilerobot: nonFilerobotMedia
    };
    
    return media;
  },
  recordFile: async (ctx) => {
    var file = ctx.request.body.file;
    var action = ctx.request.body.action;
    var config = ctx.request.body.config;

    var url = (action === 'export') ? file.link : file.url.cdn;
    var name = (action === 'export') ? file.file.name : file.name;
    var alt = (action === 'export') ? file.file.uuid : file.uuid;
    var ext = (action === 'export') ? file.file.extension : file.extension;
    var mime = (action === 'export') ? file.file.type : file.type;
    var size = parseFloat( (action === 'export') ? file.file.size.pretty : file.size.pretty );
    var hash = (action === 'export') ? file.file.hash.sha1 : file.hash.sha1;
    var width = (action === 'export') ? file.file.info.img_w : file.info.img_w;
    var height = (action === 'export') ? file.file.info.img_h : file.info.img_h;

    url = module.exports.removeQueryParam(url, 'vh');
    url = module.exports.adjustForCname(url, config);

    // @Todo: check if already exist in DB (name, url, hash, provider=filerobot) (?)

    var admins = await strapi.query('user', 'admin').find({});
    var admin1 = admins[0];

    var result = await strapi.query('file', 'upload').create({
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
      created_by_id: admin1.id,
      updated_by_id: admin1.id,
    });

    return result;
  },
  getMedia: async (ctx) => {
    var media = await strapi.query('file', 'upload').find({});

    ctx.send(media);
  },
  removeQueryParam: (link, paramName) => {
    var url = new URL(link);
    var params = new URLSearchParams(url.search);
    params.delete(paramName);
    var newUrl = params.toString() ? `${url.origin}${url.pathname}?${params.toString()}` : `${url.origin}${url.pathname}`;

    return newUrl;
  },
  adjustForCname: (link, config) => {
    if (!config.cname)
    {
      return link;
    }

    link = link.replace(`https://${config.token}.filerobot.com/v7`, `https://${config.cname}`);

    return link;
  }
};
