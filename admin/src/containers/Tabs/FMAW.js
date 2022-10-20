import React, { useEffect, useRef } from 'react';

import pluginId from '../../pluginId';

import $ from 'jquery';

// https://www.npmjs.com/package/@filerobot/core
// https://www.npmjs.com/package/@filerobot/explorer#filerobotexplorer

import Filerobot from '@filerobot/core';
import Explorer from '@filerobot/explorer';
import XHRUpload from '@filerobot/xhr-upload';

import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';

import { request, auth } from "strapi-helper-plugin";

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
        width: '100%',
        height: '100%',
        disableExportButton: true, 
        hideExportButtonIcon: true, 
        preventExportDefaultBehavior: true,
        locale: {
          strings: {
            mutualizedExportButtonLabel: "Add to Strapi"
          }
        },
      })
      .use(XHRUpload)
      .on('export', async (files, popupExportSucessMsgFn, downloadFilesPackagedFn, downloadFileFn) => {
        $("button.filerobot-common-BaseButton").attr("disabled", "disabled");

        await recordMedia(files, 'export', config);

        $("button.filerobot-common-BaseButton").attr("disabled", false);
      })
      .on('complete', async ({ failed, uploadID, successful }) => {
        $("button.filerobot-common-BaseButton").attr("disabled", "disabled");

        if (successful)
        {
          await recordMedia(successful, 'complete', config);

          $("button.filerobot-common-BaseButton").attr("disabled", false);
        }
        else
        {
          $("button.filerobot-common-BaseButton").attr("disabled", false);
        }
      });

    return () => {
      filerobot.current.close();
    }
  }, [config]);

  const recordMedia = async (files, action, config) => {
    files.forEach(async (file, index) => {
      await request(`/${pluginId}/record-file`, {method: 'POST', headers:{'Authorization':`Bearer ${auth.getToken()}`}, body: {file:file, action:action, config:config}});

      if (files.length-1==index)
      {
        // https://stackoverflow.com/questions/69703218/reactjs-bootstrap-tab-active-after-page-reload-or-how-can-i-save-active-tabs-us/69722943#69722943
        if (typeof(Storage) !== "undefined")
        {
          sessionStorage.setItem("activeTab", "fmaw");
        }
        
        window.location.reload();
      }
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
