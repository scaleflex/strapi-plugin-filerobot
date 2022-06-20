'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require("node-fetch");
const filerobotApiDomain = 'https://api.filerobot.com';

module.exports = ({ strapi }) => ({
  getWelcomeMessage() {
    return 'Thank you for using Scaleflex Filerobot';
  },
  getPluginStore() {
    return strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
    });
  },
  async getConfig() {
    const pluginStore = this.getPluginStore();

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
    const pluginStore = this.getPluginStore();

    await pluginStore.set({
      key: 'options',
      value: ctx.request.body
    });

    const config = await pluginStore.get({ key: 'options' });

    return config;
  },
  async checkDbFiles() {
    var nonFilerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
      filters: {
        $not: {
          provider: 'filerobot',
        },
      },
      populate: { category: true },
    });
    
    var filerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
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

    // @Todo: check if already exist in DB (name, url, hash, provider=filerobot)

    var result = await strapi.entityService.create('plugin::upload.file', {
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

    return result;
  },
  async syncUp(ctx) {
    var file = ctx.request.body.file;
    var imagePath = path.join(strapi.dirs.public, file.url);
    var base64 = fs.readFileSync(imagePath, {encoding: 'base64'});

    var pluginStore = this.getPluginStore();
    var config = await pluginStore.get({ key: 'options' });
    
    var sassReqHeaders = new fetch.Headers();
    sassReqHeaders.append("Content-Type", "application/json");

    var sassReqOpt = {
      method: 'GET',
      headers: sassReqHeaders
    };

    var sassRes = await fetch(`${filerobotApiDomain}/${config.token}/key/${config.sec_temp}`, sassReqOpt);

    if (sassRes.status != 200)
    {
      return false; // @Todo: better erroneous return
    }

    var sassInfo = await sassRes.json();

    if (sassInfo.status !== "success")
    {
      return false; // @Todo: better erroneous return
    }

    var sass = sassInfo.key; // @Todo: Save SASS key into browser, instead of getting it via API all the time.

    var uploadHeaders = new fetch.Headers();
    uploadHeaders.append("Content-Type", "application/json");
    uploadHeaders.append("X-Filerobot-Key", sass);

    var raw = JSON.stringify({
      "name": file.name,
      "data": base64,
      "postactions": "decode_base64"
    });

    var uploadRequestOptions = {
      method: 'POST',
      headers: uploadHeaders,
      body: raw
    };

    var uploadRes = await fetch(`${filerobotApiDomain}/${config.token}/v4/files?folder=/${config.folder}`, uploadRequestOptions);

    if (uploadRes.status != 200)
    {
      return false; // @Todo: better erroneous return
    }

    var uploadResult = await uploadRes.json();

    if (uploadResult.status !== "success")
    {
      return false; // @Todo: better erroneous return
    }

    const updatedFileEntry = await strapi.entityService.update('plugin::upload.file', file.id, {
      data: {
        url: uploadResult.file.url.cdn,
        hash: uploadResult.file.hash.sha1,
        provider: 'filerobot',
        alternativeText: uploadResult.file.uuid,
      },
    });

    return updatedFileEntry;
  },
  async getMedia(ctx) {
    var media = await strapi.entityService.findMany('plugin::upload.file', {
      populate: { category: true },
    });

    return media;
  },
});
