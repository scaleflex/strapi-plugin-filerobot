'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require("node-fetch");
const filerobotApiDomain = 'https://api.filerobot.com';

module.exports = ({strapi}) => ({
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

    let config = {
      cname: '',
      token: '',
      sec_temp: '',
      folder: ''
    }

    const storedConfig = await pluginStore.get({key: 'options'})
    if (storedConfig) {
      config = storedConfig;
    }

    return config
  },
  async updateConfig(ctx) {
    const pluginStore = this.getPluginStore();

    await pluginStore.set({
      key: 'options',
      value: ctx.request.body
    });

    const config = await pluginStore.get({key: 'options'});

    return config;
  },
  async checkDbFiles() {
    const nonFilerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
      filters: {
        $not: {
          provider: 'filerobot',
        },
      },
      populate: {category: true},
    });

    const filerobotMedia = await strapi.entityService.findMany('plugin::upload.file', {
      filters: {
        provider: 'filerobot',
      },
      populate: {category: true},
    });

    const media = {
      filerobot: filerobotMedia,
      nonFilerobot: nonFilerobotMedia
    };

    return media;
  },
  async recordFile(ctx) {
    const file = ctx.request.body.file;
    const action = ctx.request.body.action;
    const config = ctx.request.body.config;

    let url = (action === 'export') ? file.link : file.url.cdn;
    const name = (action === 'export') ? file.file.name : file.name;
    const alt = (action === 'export') ? file.file.uuid : file.uuid;
    const ext = (action === 'export') ? file.file.extension : file.extension;
    const mime = (action === 'export') ? file.file.type : file.type;
    const size = parseFloat((action === 'export') ? file.file.size.pretty : file.size.pretty);
    const hash = (action === 'export') ? file.file.hash.sha1 : file.hash.sha1;
    const width = (action === 'export') ? file.file.info.img_w : file.info.img_w;
    const height = (action === 'export') ? file.file.info.img_h : file.info.img_h;

    url = this.removeQueryParam(url, 'vh');
    url = this.adjustForCname(url, config);

    // @Todo: check if already exist in DB (name, url, hash, provider=filerobot) (?)

    const admins = await strapi.entityService.findMany('admin::user');
    const admin1 = admins[0];

    const result = await strapi.entityService.create('plugin::upload.file', {
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
        created_by_id: admin1.id,
        updated_by_id: admin1.id,
        folderPath: '/',
      },
    });

    return result;
  },
  async syncUp(ctx) {
    const file = ctx.request.body.file;
    const config = ctx.request.body.config;
    const imagePath = strapi.dirs.public
      ? path.join(strapi.dirs.public, file.url)
      : path.join(strapi.dirs.static.public, file.url); // To accomodate for Strapi v4.3.x
    let base64 = '';

    try {
      base64 = fs.readFileSync(imagePath, {encoding: 'base64'});
    } catch (err) {
      return false;
    }

    const pluginStore = this.getPluginStore();
    const pluginConfig = await pluginStore.get({key: 'options'});

    const sass = await this.getSass(pluginConfig);

    if (!sass) {
      return false;
    }

    let uploadHeaders = new fetch.Headers();
    uploadHeaders.append("Content-Type", "application/json");
    uploadHeaders.append("X-Filerobot-Key", sass);

    const raw = JSON.stringify({
      "name": file.name,
      "data": base64,
      "postactions": "decode_base64"
    });

    const uploadRequestOptions = {
      method: 'POST',
      headers: uploadHeaders,
      body: raw
    };

    const uploadRes = await fetch(`${filerobotApiDomain}/${config.token}/v4/files?folder=/${config.folder}`, uploadRequestOptions);

    if (uploadRes.status !== 200) {
      return false;
    }

    const uploadResult = await uploadRes.json();

    if (uploadResult.status !== "success") {
      return false;
    }

    let url = uploadResult.file.url.cdn;
    url = this.removeQueryParam(url, 'vh');
    url = this.adjustForCname(url, config);

    const updatedFileEntry = await strapi.entityService.update('plugin::upload.file', file.id, {
      data: {
        url: url,
        hash: uploadResult.file.hash.sha1,
        provider: 'filerobot',
        alternativeText: uploadResult.file.uuid,
        formats: null,
      },
    });

    return updatedFileEntry;
  },
  async getMedia(ctx) {
    const queryParams = ctx.request.query;

    const media = await strapi.entityService.findMany('plugin::upload.file', {
      populate: {category: true},
      limit: queryParams.limit,
      start: queryParams.offset * queryParams.limit,
    });

    return media;
  },
  async getMediaCount(ctx) {
    const media = await strapi.entityService.findMany('plugin::upload.file', {
      populate: {category: true},
    });

    return media.length;
  },
  async validateSass(sassKey, token) {
    const headers = new fetch.Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Filerobot-Key", sassKey);

    const requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };

    const response = await fetch(`${filerobotApiDomain}/${token}/v4/files/`, requestOptions);

    return response.json();
  },
  async getNewSassKey(config) {
    const sassReqHeaders = new fetch.Headers();
    sassReqHeaders.append("Content-Type", "application/json");

    const sassReqOpt = {
      method: 'GET',
      headers: sassReqHeaders
    };

    const sassRes = await fetch(`${filerobotApiDomain}/${config.token}/key/${config.sec_temp}`, sassReqOpt);

    if (sassRes.status != 200) {
      return false; // @Todo: better erroneous return
    }

    const sassInfo = await sassRes.json();

    if (sassInfo.status !== "success") {
      return false; // @Todo: better erroneous return
    }

    const sass = sassInfo.key;

    if (typeof (Storage) !== "undefined") {
      sessionStorage.setItem("sassKey", sass);
    }

    return sass;
  },
  async getSass(config) {
    let sass = '';

    if (typeof (Storage) !== "undefined" && sessionStorage.getItem("sassKey")) {
      sass = sessionStorage.getItem("sassKey");

      const sassValidation = await this.validateSass(sass, config.token);

      if (sassValidation.code === 'KEY_EXPIRED' || sassValidation.code === 'UNAUTHORIZED') {
        sass = await this.getNewSassKey(config);

        if (sass === false) {
          return false;
        }
      }

      return sass;
    } else {
      sass = await this.getNewSassKey(config);

      if (sass === false) {
        return false;
      }

      return sass;
    }
  },
  removeQueryParam(link, paramName) {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);
    params.delete(paramName);
    const newUrl = params.toString() ? `${url.origin}${url.pathname}?${params.toString()}` : `${url.origin}${url.pathname}`;

    return newUrl;
  },
  adjustForCname(link, config) {
    if (!config.cname) {
      return link;
    }

    link = link.replace(`https://${config.token}.filerobot.com/v7`, `https://${config.cname}`);

    return link;
  },
});
