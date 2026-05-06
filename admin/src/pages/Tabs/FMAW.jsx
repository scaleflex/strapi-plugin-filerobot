import React, { useState } from 'react';
import { AssetPicker } from '@scaleflex/asset-picker/react';
import { useIntl } from 'react-intl';
import { Box, Alert, Button, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../../pluginId';

const FMAW = ({ config }) => {
  const { post } = useFetchClient();
  const intl = useIntl();
  const [success, setSuccess] = useState(false);

  if (!config || !config.token || !config.sec_temp) {
    return (
      <Box paddingTop={4}>
        <Typography>
          {intl.formatMessage({ id: `${PLUGIN_ID}.label.fmaw.no_config`, defaultMessage: 'Please configure Scaleflex DAM credentials first.' })}
        </Typography>
      </Box>
    );
  }

  const pickerConfig = {
    auth: {
      mode: 'securityTemplate',
      securityTemplateKey: config.sec_temp,
      projectToken: config.token,
    },
    rootFolderPath: config.folder || '/',
    displayMode: 'inline',
    uploader: {},
  };

  const handleSelect = async (assets) => {
    for (let i = 0; i < assets.length; i++) {
      await post(`/${PLUGIN_ID}/record-file`, {
        file: assets[i],
        action: 'picker',
        config,
      });
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <>
      {success && (
        <Box marginTop={2}>
          <Alert
            title={intl.formatMessage({ id: `${PLUGIN_ID}.label.fmaw.success_title`, defaultMessage: 'Success' })}
            onClose={() => setSuccess(false)}
            closeLabel="Close alert"
            variant="success"
          >
            {intl.formatMessage({ id: `${PLUGIN_ID}.label.fmaw.success_body`, defaultMessage: 'Item(s) added to Strapi Media.' })}
          </Alert>
        </Box>
      )}
      <Box marginTop={2} style={{ '--ap-inline-height': '800px' }}>
        <AssetPicker config={pickerConfig} onSelect={handleSelect} />
      </Box>
    </>
  );
};

export { FMAW };
