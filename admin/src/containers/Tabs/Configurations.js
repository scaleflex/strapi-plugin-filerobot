import React from "react";
import pluginId from '../../pluginId';

import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { request } from "strapi-helper-plugin";

const Configurations = (props) => {
  const config = props.config;
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

    if (config.token === '' || config.sec_temp === '')
    {
      return;
      //@Todo: Show error too
    }

    const result = await request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/update-config`, {method: 'PUT', body: config});
    console.dir(result);
  }

  return (
    <div>
      <h2>Filerobot Configurations</h2>

      <Form onSubmit={update}>
        <Form.Group controlId="token">
          <Form.Label>Token</Form.Label>
          <Form.Control name="token" type="text" defaultValue={config.token} />
        </Form.Group>

        <Form.Group controlId="sec_temp">
          <Form.Label>Security Template Identifier</Form.Label>
          <Form.Control name="sec_temp" type="text" defaultValue={config.sec_temp} />
        </Form.Group>

        <Form.Group controlId="folder">
          <Form.Label>Folder</Form.Label>
          <Form.Control name="folder" type="text" defaultValue={config.folder} />
        </Form.Group>

        <Form.Group controlId="fr_url">
          <Form.Label>Use Filerobot URL</Form.Label>
          <Form.Select name="fr_url">
            <option value="1" selected={config.fr_url == 1} >Yes</option>
            <option value="0" selected={config.fr_url == 0} >No</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default Configurations;
