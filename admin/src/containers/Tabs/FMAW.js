import React, { useEffect, useRef } from 'react';

// https://www.npmjs.com/package/@filerobot/core
// https://www.npmjs.com/package/@filerobot/explorer#filerobotexplorer

import Filerobot from '@filerobot/core';
import Explorer from '@filerobot/explorer';
import XHRUpload from '@filerobot/xhr-upload';

import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';

const FMAW = (props) => {
  const config = props.config;
  console.dir(config);

  const filerobot = useRef(null);

  useEffect(() => {
    filerobot.current = Filerobot({ //@Todo: Don't hardcode like this
      securityTemplateID : config.sec_temp || 'fkklnkm',
      container          : config.token || 'SECU_32768A31C93240D3A1B9B1CE339E13DF'
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
        console.dir(files);
        // https://dev.to/bassel17/how-to-upload-an-image-to-strapi-2hhg
      })
      .on('complete', ({ failed, uploadID, successful }) => {
        console.dir(successful);
        // https://dev.to/bassel17/how-to-upload-an-image-to-strapi-2hhg
      });

    // return () => {
    //   filerobot.current.close();
    // }
  }, [config]);

  return (
    <div>
      <h2>Filerobot Media Asset Widget</h2>

      <div id="filerobot-widget"></div>
    </div>
  );
};

export default FMAW;
