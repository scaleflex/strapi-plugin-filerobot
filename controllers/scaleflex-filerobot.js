'use strict';

// Strapi 3 DB access: https://strapi.gitee.io/documentation/v3.x/concepts/queries.html

const fs = require('fs');
const path = require('path');
const fetch = require("node-fetch");
const filerobotApiDomain = 'https://api.filerobot.com';

module.exports = {
  index: async (ctx) => {
    ctx.send({
      message: 'ok'
    });
  },
  getPluginStore: () => {
    return strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'filerobot',
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
    
    ctx.send(media);
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

    ctx.send(result);
  },
  syncUp: async (ctx) => {
    var file = ctx.request.body.file;
    var config = ctx.request.body.config;
    var imagePath = path.join(strapi.dir, 'public', file.url);
    var base64 = '';

    try 
    {
      base64 = fs.readFileSync(imagePath, {encoding: 'base64'});
    } 
    catch (err) 
    {
      console.error(err);
      
      return false;
    }

    var pluginStore = module.exports.getPluginStore();
    var config = await pluginStore.get({ key: 'options' });

    var sass = await module.exports.getSass(config);

    if (sass === false)
    {
      return false;
    }

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

    //@Todo: Needs fixing
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

    var url = uploadResult.file.url.cdn;
    url = module.exports.removeQueryParam(url, 'vh');
    url = module.exports.adjustForCname(url, config);

    const updatedFileEntry = await strapi.query('file', 'upload').update(
      { 
        id: file.id 
      },
      {
        url: url,
        hash: uploadResult.file.hash.sha1,
        provider: 'filerobot',
        alternativeText: uploadResult.file.uuid,
        formats: null,
      }
    );

    ctx.send(updatedFileEntry);
  },
  getMedia: async (ctx) => {
    var queryParams = ctx.request.query;

    var media = await strapi.query('file', 'upload').find({
      _limit: queryParams.limit,
      _start: queryParams.offset * queryParams.limit
    });

    ctx.send(media);
  },
  getMediaCount: async (ctx) => {
    var media = await strapi.query('file', 'upload').find({});

    ctx.send(media.length);
  },
  getSass: async (config) => {
    var sass = '';
    
    if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
    {
      sass = sessionStorage.getItem("sassKey");

      var sassValidation = await module.exports.validateSass(sass, config.token);

      if (sassValidation.code === 'KEY_EXPIRED' || sassValidation.code === 'UNAUTHORIZED')
      {
        sass = await module.exports.getNewSassKey(config);

        if (sass === false)
        {
          return false;
        }
      }

      return sass;
    }
    else
    {
      sass = await module.exports.getNewSassKey(config);

      if (sass === false)
      {
        return false;
      }

      return sass;
    }
  },
  validateSass: async (sassKey, token) => {
    var headers = new fetch.Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Filerobot-Key", sassKey);

    var requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };

    var response = await fetch(`${filerobotApiDomain}/${token}/v4/files/`, requestOptions);

    return response.json();
  },
  getNewSassKey: async (config) => {
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

    var sass = sassInfo.key;

    if (typeof(Storage) !== "undefined")
    {
      sessionStorage.setItem("sassKey", sass);
    }

    return sass;
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
