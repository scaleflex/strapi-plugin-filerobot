import React, { useEffect, useRef, useState } from 'react';
import './custom-style.css';
import '@filerobot/core/dist/style.min.css';
import '@filerobot/explorer/dist/style.min.css';
import { useIntl } from 'react-intl';
import { Box, Alert } from '@strapi/design-system';
import { useFetchClient } from "@strapi/strapi/admin";
import { PLUGIN_ID } from '../../pluginId';
import Filerobot from "@filerobot/core";
import Explorer from "@filerobot/explorer";
import XHRUpload from "@filerobot/xhr-upload";
import ProgressPanel from "@filerobot/progress-panel";
const FMAW = (props) => {
  window.process = {
    env: {
      REACT_APP_GITLAB_REVIEW_ENV: false
    }
  }
  const { post } = useFetchClient();
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
    })
      .use(ProgressPanel, {
        target: '#sfx-widget-progress-panel',
      })
      .use(Explorer, {
    config: {
      rootFolderPath: config.folder
    },
    target : '#scaleflex-dam-widget',
    inline : true,
    width: '100%',
    height: '700px',
    disableExportButton: true,
    hideExportButtonIcon: true,
    dismissUrlPathQueryUpdate: true,
    disableDownloadButton: false,
    preventExportDefaultBehavior: true,
    hideDownloadButtonIcon: true,
    preventDownloadDefaultBehavior: true,
    showProgressDetails: true,
    locale: {
      strings: {
        mutualizedExportButtonLabel: intl.formatMessage({id:`${PLUGIN_ID}.label.button.fmaw.export`}),
        mutualizedDownloadButton: intl.formatMessage({id:`${PLUGIN_ID}.label.button.fmaw.export`}),
      }
    }
  })
      .use(XHRUpload)
      .on('export', async (files, popupExportSuccessMsgFn, downloadFilesPackagedFn, downloadFileFn) => {
        console.log(files);
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
      await post(`/${PLUGIN_ID}/record-file`, {method: 'POST', file:file, action:action, config:config});
      isSuccess = (files.length-1 === index)
    }
    setSuccess(isSuccess);

    setTimeout(() => {
      setSuccess(false)
    }, 4000)
  }

  function ensureScaleflexWidgetLoaded() {
    return new Promise((resolve, reject) => {

      // --- 1) Load CSS ---
      let cssEl = document.querySelector('link[data-sfx-widget-css="1"]');
      if (!cssEl) {
        cssEl = document.createElement('link');
        cssEl.rel = 'stylesheet';
        cssEl.href = SFX_WIDGET_CSS;
        cssEl.setAttribute('data-sfx-widget-css', '1');
        document.head.appendChild(cssEl);
      }

      // CSS does not need to wait for loading to finish, because it does not affect JS execution.


      // --- 2) Load JS ---
      let jsEl = document.querySelector('script[data-sfx-widget-js="1"]');
      if (jsEl) {
        // If previously loaded
        if (jsEl.getAttribute('data-loaded') === 'true') {
          return resolve();
        }
        // If it is loading → wait for it
        jsEl.addEventListener('load', () => resolve());
        jsEl.addEventListener('error', () => reject(new Error('Failed to load Scaleflex Widget JS')));
        return;
      }

      // If there is no script → create a new one
      jsEl = document.createElement('script');
      jsEl.src = SFX_WIDGET_JS;
      jsEl.async = true;
      jsEl.defer = true;
      jsEl.setAttribute('data-sfx-widget-js', '1');

      jsEl.addEventListener('load', () => {
        jsEl.setAttribute('data-loaded', 'true');
        resolve();
      });

      jsEl.addEventListener('error', () => {
        reject(new Error('Failed to load Scaleflex Widget JS'));
      });

      document.head.appendChild(jsEl);
    });
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
      <Box marginTop={2} id="scaleflex-dam-widget"></Box>
      <Box id="sfx-widget-progress-panel"></Box>
      <Box paddingTop={10}></Box>
    </>
  );
};

export { FMAW };
