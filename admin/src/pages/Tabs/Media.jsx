import React, { useEffect, useState } from 'react';
import { useFetchClient } from "@strapi/strapi/admin";
import { useIntl } from 'react-intl';
import { Table, Thead, Tbody, Tr, Td, Th, Avatar, Typography, Box, Button, Flex  } from '@strapi/design-system';
import { PLUGIN_ID } from '../../pluginId';

const Media = () => {
  const intl = useIntl();
  const [media, setMedia] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const recordPerPage = 10;
  const { get } = useFetchClient();

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    let listMedia = await get(`/${PLUGIN_ID}/media?limit=${recordPerPage}&offset=${pageNumber-1}`);
    setMedia(listMedia.data);
  };

  useEffect(() => {
    const countMedia = async () => {
      try {
        const itemCounts = await get(`/${PLUGIN_ID}/media-count`);
        setTotalRecords(itemCounts.data);
        setPageCount(Math.ceil(itemCounts.data/recordPerPage))
      } catch (err) {
        console.error(err);
      }
    };
    countMedia();

    const fetchMedia = async () => {
      try {
        const response = await get(`/${PLUGIN_ID}/media?limit=${recordPerPage}&offset=${currentPage-1}`);
        setMedia(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchMedia();

  }, [get]);
  console.log(media);
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
                  <img src={entry.url} alt="" style={{width: "80px", borderRadius: "6px", height: "80px", objectFit: "cover"}}/>
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

export { Media };
