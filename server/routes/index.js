module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'scaleflexDAM.index',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'scaleflexDAM.getConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/update-config',
    handler: 'scaleflexDAM.updateConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/db-files',
    handler: 'scaleflexDAM.checkDbFiles',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/record-file',
    handler: 'scaleflexDAM.recordFile',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/sync-up',
    handler: 'scaleflexDAM.syncUp',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/media',
    handler: 'scaleflexDAM.getMedia',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/media-count',
    handler: 'scaleflexDAM.getMediaCount',
    config: {
      policies: [],
      auth: false,
    },
  },
];
