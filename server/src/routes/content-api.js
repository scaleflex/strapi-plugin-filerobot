export default [
  {
    method: 'GET',
    path: '/',
    // name of the controller file & the method.
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'controller.getConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/update-config',
    handler: 'controller.updateConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/db-files',
    handler: 'controller.checkDbFiles',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/record-file',
    handler: 'controller.recordFile',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/sync-up',
    handler: 'controller.syncUp',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/media',
    handler: 'controller.getMedia',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/media-count',
    handler: 'controller.getMediaCount',
    config: {
      policies: [],
      auth: false,
    },
  },
];
