import React, {memo, useState, useEffect} from 'react';
import { Stack, Box, Tabs, Tab, TabGroup, TabPanels, TabPanel, Typography  } from '@strapi/design-system';
import Configurations from '../Tabs/Configurations.js'
import FMAW from '../Tabs/FMAW.js'
import Media from '../Tabs/Media.js'
import pluginId from '../../pluginId';
import { request } from "@strapi/helper-plugin";

const HomePage = () => {

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(`/${pluginId}/config`, {method: 'GET'}).then(config => {
      setConfig(config)
      setLoading(false);
    });
  }, []);


  if (loading)
    return (
      <Typography>fetching configuration...</Typography>
    )


  return (
    <>
      <Stack spacing={4} padding={3}>
        <Box paddingLeft={8} paddingTop={5} paddingRight={8}>
          <Typography variant={'alpha'}>Filerobot by Scaleflex</Typography>
        </Box>
        <Box padding={8} >
          <TabGroup label="Some stuff for the label" id="tabs" onTabChange={selected => console.log(selected)}>
            <Tabs>
              <Tab>Configurations</Tab>
              <Tab>Asset Manager</Tab>
              <Tab>Media</Tab>
            </Tabs>
            <TabPanels>
              <TabPanel>
                <Box color="neutral800" padding={4} background="neutral0">
                  <Configurations config={config} />
                </Box>
              </TabPanel>
              <TabPanel>
                <Box color="neutral800" padding={4} background="neutral0">
                  <FMAW config={config} />
                </Box>
              </TabPanel>
              <TabPanel>
                <Box color="neutral800" padding={4} background="neutral0">
                  <Media />
                </Box>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Box>
      </Stack>
    </>
  )
};

export default memo(HomePage);
