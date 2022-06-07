import React, { useState } from "react";
import pluginId from '../../pluginId';

import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { request } from "@strapi/helper-plugin";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Configurations = (props) => {
  const config = props.config;

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  const update = async (event) => {
    event.preventDefault();
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
      setOpen(o => !o);

      return;
    }

    await request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/update-config`, {method: 'PUT', body: config});
  }

  const check_connection = async () => {
    const configs = await request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/config`, {method: 'GET'});
    
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
      return false;
    }
    
    var tokenCheckJson = await tokenCheck.json();

    if (tokenCheckJson.status !== 'success')
    {
      return false;
    }
    
    var checkSecTemp = await fetch(`${domain}/${configs.token}/key/${configs.sec_temp}`, requestOptions);

    if (checkSecTemp.status != 200)
    {
      return false;
    }
    
    var checkSecTempJson = await checkSecTemp.json();

    if (checkSecTempJson.status !== 'success')
    {
      return false;
    }
    console.log("OK");
    return true;
  }

  const sync_status = async () => {
    var media = await request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/db-files`, {method: 'GET'});

    var toSyncUp = media.nonFilerobot;
    var alreadyDown = media.filerobot;

    console.log(`There are ${toSyncUp.length} to sync up`);
    
    var alreadyDownNames = alreadyDown.map(x => x['name']);

    var configs = await request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/config`, {method: 'GET'});
    
    var domain = 'https://api.filerobot.com';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: headers
    };

    var filerobotResponse = await fetch(`${domain}/${configs.token}/v4/files?folder=${configs.folder}`, requestOptions);

    if (filerobotResponse.status != 200)
    {
      return false;
    }

    var filerobotResponseJson = await filerobotResponse.json();
    var filerobotMedia = filerobotResponseJson.files;
    var filerobotMediaNames = filerobotMedia.map(x => x['name']);

    var toSyncDownNames = filerobotMediaNames.filter(x => !alreadyDownNames.includes(x));

    console.log(`There are ${toSyncDownNames.length} to sync down`);
  }

  const trigger_sync = () => {
    console.log("trigger_sync");
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

        <Form.Group controlId="fr_url" className="form-group">
          <Form.Label>Use Filerobot URL</Form.Label>
          <Form.Select name="fr_url">
            <option value="1" selected={config.fr_url == 1} >Yes</option>
            <option value="0" selected={config.fr_url == 0} >No</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="user" className="form-group">
          <Form.Label>Strapi Authenticated User *</Form.Label>
          <Form.Control name="user" type="text" defaultValue={config.user} />
        </Form.Group>

        <Form.Group controlId="pass" className="form-group">
          <Form.Label>Strapi Authenticated User Password *</Form.Label>
          <Form.Control name="pass" type="password" defaultValue={config.pass} />
        </Form.Group>

        <Form.Group class="btn-group">
          <Button className="btn btn-primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>

      <div className="mb-2">
        <Button variant="secondary" size="sm" onClick={check_connection}>Check Connection</Button>{' '}
        <Button variant="secondary" size="sm" onClick={sync_status}>Synchronization Status</Button>{' '}
        <Button variant="secondary" size="sm" onClick={trigger_sync}>Trigger Synchronization</Button>
      </div>

      {/* https://github.com/yjose/reactjs-popup */}
      <div>
        <Popup open={open} closeOnDocumentClick onClose={closeModal} modal>
          <div className="content">
            Please fill the required fields *.
          </div>
          <div className="actions">
            <button className="button" onClick={closeModal}>Close</button>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default Configurations;
