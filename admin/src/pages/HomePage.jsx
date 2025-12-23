import { useIntl } from 'react-intl';
import { Main, Grid, Box, Tabs, Typography  } from '@strapi/design-system';
import React, {memo, useState, useEffect} from 'react';
import { PLUGIN_ID } from '../pluginId';
import { Configurations } from '../pages/Tabs/Configurations';
import { FMAW } from '../pages/Tabs/FMAW';
import { Media } from '../pages/Tabs/Media';
import { getTranslation } from '../utils/getTranslation';
import { useFetchClient } from "@strapi/strapi/admin";

const HomePage = () => {
  const { get } = useFetchClient();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`/${PLUGIN_ID}/config`);
        setConfig(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [get]);

  if (loading)
    return (
      <Typography>fetching configuration...</Typography>
    )

  return (
    <Main>
      <Box paddingLeft={8} paddingTop={5} paddingRight={8}>
        <Typography variant={'alpha'}>Scaleflex DAM</Typography>
      </Box>
      <Box padding={8} >
        <Tabs.Root defaultValue="configurations">
          <Tabs.List aria-label="Scaleflex DAM Managemement">
            <Tabs.Trigger value="configurations">Configurations</Tabs.Trigger>
            <Tabs.Trigger value="asset_manager">Asset Manager</Tabs.Trigger>
            <Tabs.Trigger value="media">Media</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="configurations">
            <Box color="neutral800" padding={4} background="neutral0">
              <Configurations config={config} />
            </Box>
          </Tabs.Content>
          <Tabs.Content value="asset_manager">
            <Box color="neutral800" padding={4} background="neutral0">
              <FMAW config={config} />
            </Box>
          </Tabs.Content>
          <Tabs.Content value="media">
            <Box color="neutral800" padding={4} background="neutral0">
              <Media />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Main>
  );
};

export { HomePage };
