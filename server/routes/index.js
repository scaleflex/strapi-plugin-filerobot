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
];
