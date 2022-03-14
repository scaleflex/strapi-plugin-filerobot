import React, { useState } from "react";
import pluginId from '../../pluginId';

import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { request } from "strapi-helper-plugin";

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
