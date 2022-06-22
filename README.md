# Strapi plugin scaleflexFilerobot

- Node v16.0.0
- Strapi v4.2.0
- Sqlite3 v5.0.2

## Setup Strapi v4

`yarn create strapi-app scaleflex-filerobot`

## Setup plugin

1. `npm run strapi generate`
2. Chose "plugin"
3. Name the plugin.

Remember to create `{CMS root folder}/config/plugins.js`

```js
module.exports = {
  'scaleflex-filerobot': {
    enabled: true,
    resolve: "./src/plugins/scaleflex-filerobot", // Folder of your plugin
  },
  'upload': {
    config: {
      provider: 'filerobot',
      providerOptions: {
        token: '...',
        sec_tmp_id: '...',
        fr_dir: 'wp_demo',
      },
    },
  },
};
```

## For upload provider

```js
module.exports = [
  'strapi::errors',
  { // start here
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'dl.airtable.com', 'fkklnkdm.filerobot.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'dl.airtable.com', 'fkklnkdm.filerobot.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  }, // end here
  'strapi::cors',
  // ...
```

## Run

In `plugins/scaleflex-filerobot`  
`npm install`

In root
```
yarn build
yarn start # For production
yarn develop # For development, with hot reload
yarn develop --watch-admin # For development, with hot reload (backend included)
```

## Update Server

### SSH into server

`ssh root@strapi.sfxconnector.com -p8022`

## Usage

https://scaleflexhq.atlassian.net/wiki/spaces/FIL/pages/19104023/Strapi+Plugin
