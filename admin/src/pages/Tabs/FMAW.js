import Filerobot from "@filerobot/core";
import Explorer from "@filerobot/explorer";
import XHRUpload from "@filerobot/xhr-upload";
import React, { useEffect, useRef, useState } from 'react';
import pluginId from '../../pluginId';
import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';
import './custom-style.css';
import { request } from "@strapi/helper-plugin";
import { useIntl } from 'react-intl';
import { Box, Alert } from '@strapi/design-system';

const FMAW = (props) => {
  const intl = useIntl();
  const config = props.config;
  const filerobot = useRef(null);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (config.token === '' || config.sec_temp === '') {
      return;
    }

    filerobot.current = Filerobot({
      securityTemplateID : config.sec_temp,
      container          : config.token
    }).use(Explorer, {
    config: {
      rootFolderPath: config.folder
    },
    target : '#filerobot-widget',
    inline : true,
    width: '100%',
    height: '700px',
    disableExportButton: false,
    hideExportButtonIcon: true,
    preventExportDefaultBehavior: true,
    resetAfterClose: true,
    dismissUrlPathQueryUpdate: true,
    locale: {
      strings: {
        mutualizedExportButtonLabel: intl.formatMessage({id:'filerobot-by-scaleflex.label.button.fmaw.export'}),
        mutualizedDownloadButton: intl.formatMessage({id:'filerobot-by-scaleflex.label.button.fmaw.export'}),
      }
    },
  })
      .use(XHRUpload)
      .on('export', async (files, popupExportSuccessMsgFn, downloadFilesPackagedFn, downloadFileFn) => {
        await recordMedia(files, 'export', config);
      })
      .on('complete', async ({ failed, uploadID, successful }) => {
        if (successful) {
          await recordMedia(successful, 'complete', config);
        }
      });

    return () => {
      filerobot.current.close();
    }
  }, [config]);

  const recordMedia = async (files, action, config) => {
    let isSuccess = false;

    for (const file of files) {
      const index = files.indexOf(file);
      await request(`/${pluginId}/record-file`, {method: 'POST', body: {file:file, action:action, config:config}});
      isSuccess = (files.length-1 === index)
    }
    setSuccess(isSuccess);

    setTimeout(() => {
      setSuccess(false)
    }, 4000)
  }

  return (
    <>
      {success && (
        <Box marginTop={2}>
          <Alert title="Successfully" onClose={() => setSuccess(false)} closeLabel="Close alert" variant={'success'} >
            Item(s) added to Strapi Media
          </Alert>
        </Box>
      )}
      <Box marginTop={2} id="filerobot-widget"></Box>
      <Box paddingTop={10}></Box>
    </>
  );
};

export default FMAW;
