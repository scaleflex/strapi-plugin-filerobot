import React from "react";
import pluginId from '../../pluginId';

import $ from 'jquery';

import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { request } from "@strapi/helper-plugin";

import { sprintf } from 'sprintf-js';
import { useIntl } from 'react-intl';

import '../../theme/index.css';

// https://www.npmjs.com/package/react-popup-alert
import Alert from 'react-popup-alert'
import 'react-popup-alert/dist/index.css';

// https://react-bootstrap.github.io/components/progress/
// https://www.youtube.com/watch?v=3sH_Kq9e5hQ
import ProgressBar from 'react-bootstrap/ProgressBar'

const Configurations = (props) => {
  const intl = useIntl();

  const config = props.config;

  const [alert, setAlert] = React.useState({
    type: 'warning',
    text: '',
    show: false
  })
  function onCloseAlert() {
    setAlert({
      type: '',
      text: '',
      show: false
    })
  }
  function onShowAlert(type, text) {
    setAlert({
      type: type,
      text: text,
      show: true
    })
  }

  const [down, setDown] = React.useState(0);
  const [up, setUp] = React.useState(0);

  const update = async (event) => {
    event.preventDefault();
    $("button").attr("disabled", "disabled");

    var config = [...event.currentTarget.elements]
      .filter((ele) => ele.type !== "submit")
      .map((ele) => {
        return {
          [ele.getAttribute("name")]: ele.value,
        };
      })
      .reduce((a, b) => ({ ...a, [Object.keys(b)[0]]: b[Object.keys(b)[0]] }), {});

    if (config.token === '' || config.sec_temp === '' || config.user === '' || config.pass === '')
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.fill_required'}));
      $("button").attr("disabled", false);

      return;
    }

    await request(`/${pluginId}/update-config`, {method: 'PUT', body: config});
    $("button").attr("disabled", false);
  }

  const check_connection = async () => {
    $("button").attr("disabled", "disabled");

    const configs = await request(`/${pluginId}/config`, {method: 'GET'});
    
    var domain = 'https://api.filerobot.com';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: headers
    };

    var tokenCheck = await fetch(`${domain}/${configs.token}/v4/files?folder=/&limit=1&`, requestOptions);

    if (tokenCheck.status != 200)
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.check_token_issue'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var tokenCheckJson = await tokenCheck.json();

    if (tokenCheckJson.status !== 'success')
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.wrong_token'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var checkSecTemp = await fetch(`${domain}/${configs.token}/key/${configs.sec_temp}`, requestOptions);

    if (checkSecTemp.status != 200)
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.check_sectmp_issue'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var checkSecTempJson = await checkSecTemp.json();

    if (checkSecTempJson.status !== 'success')
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.wrong_sectmp'}));
      $("button").attr("disabled", false);

      return false;
    }

    onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.success.sync_connection'}));
    $("button").attr("disabled", false);

    return true;
  }

  const sync_status = async () => {
    var { localMedia, filerobotMedia } = await getSyncStatus();
    var toSyncUp = localMedia.nonFilerobot;
    var alreadyDown = localMedia.filerobot;
    var alreadyDownHashs = alreadyDown.map(x => x['hash']);
    var filerobotMediaHashs = filerobotMedia.map(x => x['hash']['sha1']);
    var toSyncDown = filerobotMediaHashs.filter(x => !alreadyDownHashs.includes(x));

    onShowAlert('warning', sprintf(intl.formatMessage({id:'scaleflex-filerobot.notification.success.sync_status'}), toSyncUp.length, toSyncDown.length) );
    $("button").attr("disabled", false);

    return true;
  }

  const trigger_sync = async () => {
    var { localMedia, filerobotMedia } = await getSyncStatus();
    var toSyncUp = localMedia.nonFilerobot;
    var alreadyDown = localMedia.filerobot;

    // Better to sync down then up
    var downResult = await sync_down(filerobotMedia, alreadyDown);
    var upResult = await sync_up(toSyncUp);

    onShowAlert('warning', sprintf(intl.formatMessage({id:'scaleflex-filerobot.notification.success.sync_results'}), downResult, upResult) );
    $("button").attr("disabled", false);

    return true;
  }
  async function sync_down(filerobotMedia, alreadyDown)
  {
    var alreadyDownHashs = alreadyDown.map(x => x['hash']);
    var filerobotMediaHashs = filerobotMedia.map(x => x['hash']['sha1']);
    var toSyncDown = filerobotMediaHashs.filter(x => !alreadyDownHashs.includes(x));
    
    var count = 0;
    
    // https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/
    await Promise.all( $(filerobotMedia).map(async function( index ) {
      if ( !alreadyDownHashs.includes(this.hash.sha1) )
      {
        var result = await request(`/${pluginId}/record-file`, {method: 'POST', body: {file:this, action:'sync-down'}});

        if (result !== false)
        {
          count++;
        }
        
        console.log(`Synced down ${count} / ${toSyncDown.length}`);
        var percentage = (toSyncDown.length === 0) ? 100 : Math.ceil(count/toSyncDown.length*100);
        setDown(percentage);
      }
    }) );

    return `${count} / ${toSyncDown.length}`;
  }
  async function sync_up(toSyncUp)
  {
    var count = 0;
    
    await Promise.all( $(toSyncUp).map(async function( index ) {
      var result = await request(`/${pluginId}/sync-up`, {method: 'POST', body: {file:this}});

      if (result !== false)
      {
        count++;
      }
        
      console.log(`Synced up ${count} / ${toSyncUp.length}`);
      var percentage = (toSyncUp.length === 0) ? 100 : Math.ceil(count/toSyncUp.length*100);
      setUp(percentage);
    }) );

    return `${count} / ${toSyncUp.length}`;
  }

  async function getSyncStatus()
  {
    $("button").attr("disabled", "disabled");

    var localMedia = await request(`/${pluginId}/db-files`, {method: 'GET'});
    var configs = await request(`/${pluginId}/config`, {method: 'GET'});
    var domain = 'https://api.filerobot.com';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: headers
    };

    var filerobotDirectory = (configs.folder.charAt(0) === '/') ? configs.folder : `/${configs.folder}`;
    var filerobotResponse = await fetch(`${domain}/${configs.token}/v4/files?folder=${filerobotDirectory}`, requestOptions);

    if (filerobotResponse.status != 200)
    {
      onShowAlert('warning', intl.formatMessage({id:'scaleflex-filerobot.notification.error.sync_status'}));
      $("button").attr("disabled", false);

      return false;
    }

    var filerobotResponseJson = await filerobotResponse.json();
    var filerobotMedia = filerobotResponseJson.files;

    return {'localMedia':localMedia, 'filerobotMedia':filerobotMedia};
  }

  return (
    <div>
      <Container>
        <h2>Filerobot Configurations</h2>

        <Form onSubmit={update}>
          <Form.Group controlId="token" className="form-group">
            <Form.Label>Token *</Form.Label>
            <Form.Control name="token" type="text" defaultValue={config.token} />
          </Form.Group>

          <Form.Group controlId="sec_temp" className="form-group">
            <Form.Label>Security Template Identifier *</Form.Label>
            <Form.Control name="sec_temp" type="text" defaultValue={config.sec_temp} />
          </Form.Group>

          <Form.Group controlId="folder" className="form-group">
            <Form.Label>Folder</Form.Label>
            <Form.Control name="folder" type="text" defaultValue={config.folder} />
          </Form.Group>

          <Form.Group controlId="user" className="form-group">
            <Form.Label>Strapi Authenticated User *</Form.Label>
            <Form.Control name="user" type="text" defaultValue={config.user} />
          </Form.Group>

          <Form.Group controlId="pass" className="form-group">
            <Form.Label>Strapi Authenticated User Password *</Form.Label>
            <Form.Control name="pass" type="password" defaultValue={config.pass} />
          </Form.Group>

          <Form.Group className="btn-group">
            <Button className="btn btn-primary" type="submit">
              Submit
            </Button>
          </Form.Group>
        </Form>

        <div className="mb-2 btn-group">
          <Button variant="secondary" size="sm" onClick={check_connection}>Check Connection</Button>
          <Button variant="secondary" size="sm" onClick={sync_status}>Synchronization Status</Button>
          <Button variant="secondary" size="sm" onClick={trigger_sync}>Trigger Synchronization</Button>
        </div>

        <Row className="progress-bars">
          <Col>
            <ProgressBar now={down} label={`${down}%`} />
          </Col>
          <Col>
            <ProgressBar now={up} label={`${up}%`} />
          </Col>
        </Row>

      </Container>

      <Alert
        header={'Scaleflex Filerobot'}
        btnText={'Close'}
        text={alert.text}
        type={alert.type}
        show={alert.show}
        onClosePress={onCloseAlert}
        pressCloseOnOutsideClick={true}
        showBorderBottom={false}
        alertStyles={{'min-height': 'fit-content', 'padding': '20px'}}
        headerStyles={{}}
        textStyles={{}}
        buttonStyles={{'background-color': 'rgb(0,0,0,0.1)','color': 'black', 'margin': 0}}
      />
    </div>
  );
};

export default Configurations;
