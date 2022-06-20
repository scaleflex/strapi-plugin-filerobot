import React, { useEffect, useState } from 'react';

import pluginId from '../../pluginId';

import $ from 'jquery';

import { request } from "@strapi/helper-plugin";
import { useIntl } from 'react-intl';
import { Table } from 'react-bootstrap';

import '../../theme/index.css';

const FMAW = (props) => {
  const intl = useIntl();
  const [media, setMedia] = useState([]);

  useEffect(() => {
    request(`/${pluginId}/media`, {method: 'GET'}).then(setMedia);
  }, []);

  return (
    <div>
      <h2>Media</h2>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Provider</th>
            <th>URL</th>
            <th>Hash</th>
            <th>Alt</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {media.map(( file, index ) => {
            return (
              <tr key={index}>
                <td>{file.id}</td>
                <td>{file.name}</td>
                <td>{file.provider}</td>
                <td>{file.url}</td>
                <td>{file.hash}</td>
                <td>{file.alternativeText}</td>
                <td>{file.createdAt}</td>
                <td>{file.updatedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default FMAW;
