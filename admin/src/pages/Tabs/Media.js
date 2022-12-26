import React, { useEffect, useState } from 'react';
import pluginId from '../../pluginId';
import { request } from "@strapi/helper-plugin";
import { useIntl } from 'react-intl';
import { Table, Thead, Tbody, Tr, Td, Th, Avatar, Typography, Box, Button, Stack, Flex  } from '@strapi/design-system';

const Media = () => {
  const intl = useIntl();
  const [media, setMedia] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const recordPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    request(`/${pluginId}/media?limit=${recordPerPage}&offset=${pageNumber-1}`, {method: 'GET'}).then(setMedia);
  };

  useEffect(() => {
    request(`/${pluginId}/media-count`, {method: 'GET'}).then((itemCounts) => {
      setTotalRecords(totalRecords)
      setPageCount(Math.ceil(itemCounts/recordPerPage))
    });
    request(`/${pluginId}/media?limit=${recordPerPage}&offset=${currentPage-1}`, {method: 'GET'}).then(setMedia);
    setLoadingPage(false)
  }, []);

  return (
    <>
      {loadingPage && (
        <Box paddingTop={10}>fetching data...</Box>
      )}
      {!loadingPage && (
        <Box padding={4}>
          <Table colCount={5} rowCount={recordPerPage}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">ID</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Image</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Provider</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {media.map((entry, index) => <Tr key={index}>
                <Td>
                  <Typography textColor="neutral800">{entry.id}</Typography>
                </Td>
                <Td>
                  <Avatar src={entry.url}/>
                </Td>
                <Td>
                  <Typography textColor="neutral800">{entry.name}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">{entry.provider}</Typography>
                </Td>
              </Tr>)}
            </Tbody>
          </Table>

          <Box marginTop={5}>
            <Flex justifyContent={'space-between'}>
              {currentPage > 1 && currentPage <= pageCount && (
                <Button onClick={() => handlePageChange(currentPage - 1)} variant={'default'}>Prev Page</Button>
              )}
              {currentPage < pageCount && (
                <>
                  {currentPage === 1 && <Box />}
                  <Button onClick={() => handlePageChange(currentPage + 1)} variant={'default'}>Next Page</Button>
                </>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Media;
