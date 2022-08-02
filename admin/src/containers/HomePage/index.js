/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import $ from 'jquery';

import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Configurations from '../Tabs/Configurations.js'
import FMAW from '../Tabs/FMAW.js'
import Media from '../Tabs/Media.js'

import { request } from "strapi-helper-plugin";

const HomePage = () => {
  const [config, setConfig] = useState({
    token: '',
    sec_temp: '',
    folder: '',
    fr_url: '',
    user: '',
    pass: ''
  });

  useEffect(() => {
    request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/config`, {method: 'GET'}).then(setConfig);

    if (typeof(Storage) !== "undefined")
    {
      var activeTab = sessionStorage.getItem("activeTab");
      
      if (activeTab) 
      {
        $(`button[id$='tab-${activeTab}']`).click();
        sessionStorage.removeItem("activeTab");
      }
    }
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1>{pluginId.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })}</h1>

          <Tabs defaultActiveKey="configurations">
            <Tab eventKey="configurations" title="Configurations">
              <Configurations config={config} />
            </Tab>
            <Tab eventKey="fmaw" title="FMAW">
              <FMAW config={config} />
            </Tab>
            <Tab eventKey="media" title="Media">
              <Media config={config} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default memo(HomePage);
