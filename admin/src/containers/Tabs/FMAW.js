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
      .on('export', (files, popupExportSucessMsgFn, downloadFilesPackagedFn, downloadFileFn) => {
        // https://dev.to/bassel17/how-to-upload-an-image-to-strapi-2hhg
        // https://forum.strapi.io/t/upload-image-url/3484/2
        files.forEach((file, index) => {
          console.dir(file.link);

          fetch(file.link)
            .then(response => response.blob())
            .then(function (myBlob) {
              const formData = new FormData();
              formData.append('files', myBlob);

              // fetch('http://localhost:1337/upload', {
              //   method: 'POST',
              //   headers: {
              //     "Authorization": "Bearer ", // <- Don't forget Authorization header if you are using it.
              //   },
              //   body: formData,
              // }).then((response) => {
              //   const result = response.json()
              //   console.log("result", result)
              // }).catch(function (err) {
              //   console.log("error:");
              //   console.log(err)
              // });
              request(`/upload`, {method: 'POST', body: formData})
                .then((response) => {
                  console.dir(response);
                })
                .catch(function (err) {
                  console.dir(err);
                });
            });
        });
      })
      .on('complete', ({ failed, uploadID, successful }) => {
        if (successful)
        {
          successful.forEach((file, index) => {
            console.dir(file);
          });
        }
      });

    return () => {
      filerobot.current.close();
    }
  }, [config]);

  return (
    <div>
      <h2>Filerobot Media Asset Widget</h2>

      <div id="filerobot-widget"></div>
    </div>
  );
};

export default FMAW;
