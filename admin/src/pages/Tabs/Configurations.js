import React, {useState} from "react";
import {Stack, Field, FieldLabel, Box, FieldInput, Button, Alert, ProgressBar, Typography} from '@strapi/design-system';
import {sprintf} from 'sprintf-js';
import {useIntl} from 'react-intl';
import pluginId from '../../pluginId';
import {request} from "@strapi/helper-plugin";

const Configurations = (props) => {
  const filerobotApiDomain = 'https://api.filerobot.com';
  const intl = useIntl();
  const config = props.config;

  const [cname, setCname] = useState(config.cname ? config.cname : '');
  const [token, setToken] = useState(config.token ? config.token : '');
  const [secTemp, setSecTemp] = useState(config.sec_temp ? config.sec_temp : '');
  const [folder, setFolder] = useState(config.folder ? config.folder : '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [syncMessage, setSyncMessage] = useState(false);
  const [disabledAllButtons, setDisabledAllButtons] = useState(false)
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);

  const saveConfiguration = async () => {
    const config = {
      cname: cname,
      token: token,
      sec_temp: secTemp,
      folder: folder
    }

    setDisabledAllButtons(true)

    await fetch(filerobotApiDomain + "/" + token + "/key/" + secTemp).then(async (response) => {
      if (response.status === 200) {
        await request(`/${pluginId}/update-config`, {method: 'PUT', body: config}).then(data => {
          setSuccess(true)
        });
      } else {
        setError(true);
      }

      setDisabledAllButtons(false)

      setTimeout(() => {
        setError(false)
        setSuccess(false)
      }, 4000)
    })
  }

  const getNewSassKey = async (config) => {
    let sassReqHeaders = new Headers();
    sassReqHeaders.append("Content-Type", "application/json");

    const sassReqOpt = {
      method: 'GET',
      headers: sassReqHeaders
    };
    const sassRes = await fetch(`${filerobotApiDomain}/${config.token}/key/${config.sec_temp}`, sassReqOpt);
    if (sassRes.status !== 200) {
      return false;
    }

    const sassInfo = await sassRes.json();
    if (sassInfo.status !== "success") {
      return false;
    }
    const sass = sassInfo.key;
    if (typeof (Storage) !== "undefined") {
      sessionStorage.setItem("sassKey", sass);
    }
    return sass;
  }

  const getSass = async (config) => {
    let sass;
    sass = await getNewSassKey(config);
    return sass;
  }

  const getSyncStatus = async () => {
    const localMedia = await request(`/${pluginId}/db-files`, {method: 'GET'});
    const configs = await request(`/${pluginId}/config`, {method: 'GET'});
    const sass = await getSass(configs);

    if (!sass) {
      setSyncMessage(intl.formatMessage({id: 'filerobot-by-scaleflex.notification.error.check_sectmp_issue'}))

      return {
        localMedia: false,
        filerobotMedia: false
      }
    }


    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Filerobot-Key", sass);

    const requestOptions = {
      method: 'GET',
      headers: headers
    };

    const filerobotDirectory = (configs.folder.charAt(0) === '/') ? configs.folder : `/${configs.folder}`;
    const filerobotResponse = await fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=${filerobotDirectory}`, requestOptions);

    if (filerobotResponse.status !== 200) {
      setSyncMessage(intl.formatMessage({id: 'filerobot-by-scaleflex.notification.error.sync_status'}))
      return {
        localMedia: false,
        filerobotMedia: false
      }
    }

    const filerobotResponseJson = await filerobotResponse.json();
    const filerobotMedia = filerobotResponseJson.files;

    return {
      localMedia: localMedia,
      filerobotMedia: filerobotMedia
    };
  }

  const syncStatus = async () => {
    setDisabledAllButtons(true)

    const {localMedia, filerobotMedia} = await getSyncStatus();

    if (localMedia === false && filerobotMedia === false) {
      setSyncMessage(intl.formatMessage({id: 'filerobot-by-scaleflex.notification.error.wrong_sectmp'}));
    }

    const toSyncUp = localMedia.nonFilerobot;
    const alreadyDown = localMedia.filerobot;
    const alreadyDownHashs = alreadyDown.map(x => x['hash']);
    const filerobotMediaHashs = filerobotMedia.map(x => x['hash']['sha1']);
    const toSyncDown = filerobotMediaHashs.filter(x => !alreadyDownHashs.includes(x));
    setSyncMessage(sprintf(intl.formatMessage({id: 'filerobot-by-scaleflex.notification.success.sync_status'}), toSyncUp.length, toSyncDown.length))
    setDisabledAllButtons(false)

    setTimeout(() => {
      setSyncMessage(false)
    }, 4000)
  }

  const triggerSync = async () => {
    setDisabledAllButtons(true)
    const {localMedia, filerobotMedia} = await getSyncStatus();
    const toSyncUp = localMedia.nonFilerobot;
    const alreadyDown = localMedia.filerobot;
    const downResult = await syncDown(filerobotMedia, alreadyDown);
    const upResult = await syncUp(toSyncUp);
    setSyncMessage(sprintf(intl.formatMessage({id: 'filerobot-by-scaleflex.notification.success.sync_results'}), downResult, upResult))
    setDisabledAllButtons(false)
  }
  const syncDown = async (filerobotMedia, alreadyDown) => {
    const alreadyDownHashs = alreadyDown.map(x => x['hash']);
    const filerobotMediaHashs = filerobotMedia.map(x => x['hash']['sha1']);
    const toSyncDown = filerobotMediaHashs.filter(x => !alreadyDownHashs.includes(x));

    let count = 0;
    await Promise.all(filerobotMedia.map(async (index) => {
      if (!alreadyDownHashs.includes(index.hash.sha1)) {
        const result = await request(`/${pluginId}/record-file`, {
          method: 'POST',
          body: {file: index, action: 'sync-down', config: config}
        });

        if (result) {
          count++;
        }
        const percentage = (toSyncDown.length === 0) ? 100 : Math.ceil(count / toSyncDown.length * 100);
        setDown(percentage);
      }
    }));
    return `${count} / ${toSyncDown.length}`;
  }
  const syncUp = async (toSyncUp) => {
    let count = 0;

    await Promise.all(toSyncUp.map(async (index) => {
      const result = await request(`/${pluginId}/sync-up`, {method: 'POST', body: {file: index, config: config}});
      if (result) {
        count++;
      }
      const percentage = (toSyncUp.length === 0) ? 100 : Math.ceil(count / toSyncUp.length * 100);
      setUp(percentage);
    }));
    return `${count} / ${toSyncUp.length}`;
  }

  return (
    <Stack spacing={4} padding={4}>
      {success && (
        <Alert title="Successfully" onClose={() => setSuccess(false)} closeLabel="Close alert" variant={'success'}>
          Configuration updated
        </Alert>
      )}
      {error && (
        <Alert title="Failed" onClose={() => setError(false)} closeLabel="Close alert" variant={'danger'}>
          Please check your configuration setting
        </Alert>
      )}
      {syncMessage && (
        <Alert title="Synchronization" onClose={() => setSyncMessage(false)} closeLabel="Close alert"
               variant={'default'}>
          {syncMessage}
        </Alert>
      )}
      <Field name="cname">
        <Stack spacing={1}>
          <FieldLabel>CNAME</FieldLabel>
          <FieldInput type="text" placeholder="CNAME" value={cname} onChange={(e) => {
            setCname(e.target.value)
          }}/>
        </Stack>
      </Field>
      <Field name="token">
        <Stack spacing={1}>
          <FieldLabel>Token</FieldLabel>
          <FieldInput type="text" placeholder="Token" value={token} onChange={(e) => {
            setToken(e.target.value)
          }}/>
        </Stack>
      </Field>
      <Field name="sec_temp">
        <Stack spacing={1}>
          <FieldLabel>Security template</FieldLabel>
          <FieldInput type="text" placeholder="Security template" value={secTemp} onChange={(e) => {
            setSecTemp(e.target.value)
          }}/>
        </Stack>
      </Field>
      <Field name="folder">
        <Stack spacing={1}>
          <FieldLabel>Folder</FieldLabel>
          <FieldInput type="text" placeholder="Folder" value={folder} onChange={(e) => {
            setFolder(e.target.value)
          }}/>
        </Stack>
      </Field>
      <Box width={200}>
        <Button disabled={disabledAllButtons} onClick={() => saveConfiguration()}>Save configuration</Button>
      </Box>
      <Stack horizontal spacing={4}>
        <Button disabled={disabledAllButtons} onClick={() => syncStatus()} variant={'secondary'}>Synchronization
          Status</Button>
        <Button disabled={disabledAllButtons} onClick={() => triggerSync()} variant={'secondary'}>Trigger
          Synchronization</Button>
      </Stack>
      {up !== 0 && (
        <Stack spacing={2}>
          <Typography>Sync up</Typography>
          <ProgressBar value={up}>{syncMessage}</ProgressBar>
        </Stack>
      )}
      {down !== 0 && (
        <Stack spacing={2}>
          <Typography>Sync down</Typography>
          <ProgressBar value={down}>{syncMessage}</ProgressBar>
        </Stack>
      )}
    </Stack>
  )
};

export default Configurations;
