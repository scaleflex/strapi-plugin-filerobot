module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'scaleflexFilerobot.index',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'scaleflexFilerobot.getConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/update-config',
    handler: 'scaleflexFilerobot.updateConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/db-files',
    handler: 'scaleflexFilerobot.checkDbFiles',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/record-file',
    handler: 'scaleflexFilerobot.recordFile',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/sync-up',
    handler: 'scaleflexFilerobot.syncUp',
    config: {
      policies: [],
      auth: false,
    },
  },
];
