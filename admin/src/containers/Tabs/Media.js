import React, { useEffect, useState } from 'react';
import pluginId from '../../pluginId';
import $ from 'jquery';
import { request } from "strapi-helper-plugin";
import { useIntl } from 'react-intl';
import { Table } from 'react-bootstrap';
import Pagination from "react-js-pagination";

const Media = (props) => {
  const intl = useIntl();
  const [media, setMedia] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/media?limit=${recordPerPage}&offset=${pageNumber-1}`, {method: 'GET'}).then(setMedia);
  };

  useEffect(() => {
    request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/media-count`, {method: 'GET'}).then(setTotalRecords);

    request(`/${pluginId.replace(/([A-Z])/g, ' $1').toLowerCase().replace(' ', '-')}/media?limit=${recordPerPage}&offset=${currentPage-1}`, {method: 'GET'}).then(setMedia);
  }, []);

  useEffect(() => {
    if (totalRecords > recordPerPage)
    {
      $('.page-pagination').show();
    }
    else
    {
      $('.page-pagination').hide();
    }
  }, [totalRecords]);

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
                <td>{file.created_at}</td>
                <td>{file.updated_at}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className='page-pagination'>
        <Pagination
          prevPageText='Prev'
          nextPageText='Next'
          firstPageText='First'
          lastPageText='Last'
          activePage={currentPage}
          itemsCountPerPage={recordPerPage}
          totalItemsCount={totalRecords}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    </div>
  );
};

export default Media;
