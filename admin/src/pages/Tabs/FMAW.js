import React, { useEffect, useRef } from 'react';

import pluginId from '../../pluginId';

// https://www.npmjs.com/package/@filerobot/core
// https://www.npmjs.com/package/@filerobot/explorer#filerobotexplorer

import Filerobot from '@filerobot/core';
import Explorer from '@filerobot/explorer';
import XHRUpload from '@filerobot/xhr-upload';

import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';

import { request } from "@strapi/helper-plugin";

import { useIntl } from 'react-intl';

const FMAW = (props) => {
  const intl = useIntl();
  const config = props.config;
  const filerobot = useRef(null);

  useEffect(() => {
    if (config.token === '' || config.sec_temp === '')
    {
      return;
    }

    var folder = config.folder;

    if (folder === '')
    {
      folder = '/';
    }
    else if ( !folder.startsWith('/') )
    {
      folder = '/' + folder;
    }

    filerobot.current = Filerobot({
      securityTemplateID : config.sec_temp,
      container          : config.token
    })
      .use(Explorer, {
        config: {
          rootFolderPath: folder
        },
        target : '#filerobot-widget',
        inline : true,
        width  : 10000,
        height : 1000,
        disableExportButton: true, 
        hideExportButtonIcon: true, 
        preventExportDefaultBehavior: true,
        locale: {
          strings: {
            exportButtonLabel: intl.formatMessage({id:'scaleflex-filerobot.label.button.fmaw.export'})
          }
        },
      })
      .use(XHRUpload)
      .on('export', async (files, popupExportSucessMsgFn, downloadFilesPackagedFn, downloadFileFn) => { // @Todo Disable Export and Upload buttons while processing
        await uploadMedia(files, 'export');
      })
      .on('complete', async ({ failed, uploadID, successful }) => { // @Todo Disable Export and Upload buttons while processing
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
    var formdata = new FormData();
    formdata.append("identifier", config.user);
    formdata.append("password", config.pass);

    var requestOptions = {
      method: 'POST',
      body: formdata
    };

    var authResponse = await fetch(`${strapi.backendURL}/api/auth/local`, requestOptions);

    if (authResponse.status != 200)
    {
      return;
    }

    var authData = await authResponse.json();

    if (authData.hasOwnProperty('error'))
    {
      return;
    }

    files.forEach(async (file, index) => {
      // @Todo: Move into service
      // var url = (action === 'export') ? file.link : file.url.cdn;
      // var name = (action === 'export') ? file.file.name : file.name;
      // var alt = (action === 'export') ? file.file.uuid : file.uuid;

      await request(`/${pluginId}/record-file`, {method: 'POST', body: file});
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
