import React from "react";
import pluginId from '../../pluginId';

import $ from 'jquery';

import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { request } from "@strapi/helper-plugin";

import { sprintf } from 'sprintf-js';
import { useIntl } from 'react-intl';

import '../../theme/index.css';

const Configurations = (props) => {
  const intl = useIntl();

  const config = props.config;

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
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.fill_required'})); // @Todo: Better popups
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
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.check_token_issue'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var tokenCheckJson = await tokenCheck.json();

    if (tokenCheckJson.status !== 'success')
    {
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.wrong_token'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var checkSecTemp = await fetch(`${domain}/${configs.token}/key/${configs.sec_temp}`, requestOptions);

    if (checkSecTemp.status != 200)
    {
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.check_sectmp_issue'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    var checkSecTempJson = await checkSecTemp.json();

    if (checkSecTempJson.status !== 'success')
    {
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.wrong_sectmp'}));
      $("button").attr("disabled", false);

      return false;
    }
    
    alert(intl.formatMessage({id:'scaleflex-filerobot.notification.success.sync_connection'}));
    $("button").attr("disabled", false);

    return true;
  }

  const sync_status = async () => {
    $("button").attr("disabled", "disabled");

    var media = await request(`/${pluginId}/db-files`, {method: 'GET'});

    var toSyncUp = media.nonFilerobot;
    var alreadyDown = media.filerobot;
    
    var alreadyDownNames = alreadyDown.map(x => x['name']);

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
      alert(intl.formatMessage({id:'scaleflex-filerobot.notification.error.sync_status'}));
      $("button").attr("disabled", false);

      return false;
    }

    var filerobotResponseJson = await filerobotResponse.json();
    var filerobotMedia = filerobotResponseJson.files;
    var filerobotMediaNames = filerobotMedia.map(x => x['name']);

    var toSyncDownNames = filerobotMediaNames.filter(x => !alreadyDownNames.includes(x));

    alert( sprintf(intl.formatMessage({id:'scaleflex-filerobot.notification.success.sync_status'}), toSyncUp.length, toSyncDownNames.length) );
    $("button").attr("disabled", false);

    return true;
  }

  const trigger_sync = () => { // @Todo: Finish
    $("button").attr("disabled", "disabled");
    alert("trigger_sync");
    $("button").attr("disabled", false);

    // Update DB too : plugin::upload.file

    return true;
  }

  return (
    <div>
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

    </div>
  );
};

export default Configurations;
