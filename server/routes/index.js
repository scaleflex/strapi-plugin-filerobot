module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'scaleflexFilerobot.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'scaleflexFilerobot.getConfig',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/update-config',
    handler: 'scaleflexFilerobot.updateConfig',
    config: {
      policies: [],
    },
  },
];
