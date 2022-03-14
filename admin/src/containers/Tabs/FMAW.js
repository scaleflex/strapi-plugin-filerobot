import React, { useEffect, useRef } from 'react';

// https://www.npmjs.com/package/@filerobot/core
// https://www.npmjs.com/package/@filerobot/explorer#filerobotexplorer

import Filerobot from '@filerobot/core';
import Explorer from '@filerobot/explorer';
import XHRUpload from '@filerobot/xhr-upload';

import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';

import { request } from "strapi-helper-plugin";

const FMAW = (props) => {
  const config = props.config;
  const filerobot = useRef(null);

  useEffect(() => {
    if (config.token === '' || config.sec_temp === '')
    {
      return;
    }

    filerobot.current = Filerobot({
      securityTemplateID : config.sec_temp,
      container          : config.token
    })
      .use(Explorer, {
        config: {
          rootFolderPath: config.folder
        },
        target : '#filerobot-widget',
        inline : true,
        width  : 10000,
        height : 1000,
        locale: {
          strings: {
            export: 'Add'
          }
        },
      })
      .use(XHRUpload)
      .on('export', async (files, popupExportSucessMsgFn, downloadFilesPackagedFn, downloadFileFn) => {
        await uploadMedia(files, 'export');
      })
      .on('complete', async ({ failed, uploadID, successful }) => {
        if (successful)
        {
          await uploadMedia(successful, 'complete');
        }
      });

    return () => {
      filerobot.current.close();
    }
  }, [config]);

  const uploadMedia = async (files, action) => {
    // https://strapi.io/blog/a-beginners-guide-to-authentication-and-authorization-in-strapi
    // https://www.youtube.com/watch?v=N4JpylgjRK0&list=PL4cUxeGkcC9h6OY8_8Oq6JerWqsKdAPxn&index=4
    const credentials = { "identifier": "admin@admin.com", "password": "Abcdefghijk1!" }; //@Todo: Don't hardcode
    // https://github.com/strapi/strapi/blob/master/packages/core/helper-plugin/lib/src/utils/request/index.js
    var authResponse = await request(`/auth/local`, {method: 'POST', body: credentials});
    console.dir(authResponse.jwt);

    files.forEach(async (file, index) => {
      console.dir(file);
      var url = (action === 'export') ? file.link : file.url.cdn;

      var fileResponse = await fetch(url);
      var fileBlob = await fileResponse.blob();

      var formData = new FormData();
      formData.append('files', fileBlob);
      formData.append('fileInfo', JSON.stringify({"alternativeText":"","caption":"","name":null}));

      // https://dev.to/bassel17/how-to-upload-an-image-to-strapi-2hhg
      // https://forum.strapi.io/t/upload-image-url/3484/2
      var uploadResponse = await fetch(`${strapi.backendURL}/upload`, { method: 'POST', headers: { "Authorization": `Bearer ${authResponse.jwt}` }, body: formData });
      console.dir(uploadResponse);

      //@Todo: Optional - find out why it won't work when it's like this
      // var uploadResponse = await request(`/upload`, { method: 'POST', headers: { "Authorization": `Bearer ${authResponse.jwt}` }, body: formData } );
      // console.dir(uploadResponse);
    });
  }

  return (
    <div>
      <h2>Filerobot Media Asset Widget</h2>

      <div id="filerobot-widget"></div>
    </div>
  );
};

export default FMAW;
