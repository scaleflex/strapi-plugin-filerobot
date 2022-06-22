# Strapi plugin scaleflexFilerobot

- Node v12.18.2
- Strapi v3.6.1
- Sqlite3 v5.0.0

## Setup Strapi v3.6.1

`npx create-strapi-app@3.6.1 scaleflex-strapi-filerobot --quickstart`

## Setup plugin

`yarn strapi generate:plugin scaleflexFilerobot`

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

In the past, the root folder contains a file called `server.js`
```js
const strapi = require('strapi');

strapi(/* {...} */).start();
```
The serving background process was created by running: `node /var/www/scaleflex-strapi-filerobot/server.js`.  
However, now that's unnecessary, because we can just run: `yarn develop`.

## Update Server

### SSH into server

`ssh root@strapi.sfxconnector.com -p8022`

## Usage

https://scaleflexhq.atlassian.net/wiki/spaces/FIL/pages/19104023/Strapi+Plugin

## Deprecation

- Development of this plugin for Strapi v3.6.1 stops on 25/May/2022
	- This Filerobot plugin for Strapi v3.6.1 was never completed; Only the FMAW functionality was completed.
	- Development stuck on the 4 questions described in this ticket: https://sfx.li/C7xKUBqvA7Fzys
	- Continued development of this plugin will be in version 4: https://code.scaleflex.cloud/Dung0812/strapi-plugin-new/-/tree/plugin-v4

## Potential problems

- Localhost XAMPP, when `npm install`
	- https://developpaper.com/gyp-err-find-python-solution/
	- https://github.com/mapbox/node-sqlite3/issues/1424#issuecomment-934302012
	- Windows have problems installing strapi-plugin-upload > sharp > libvips . https://github.com/lovell/sharp/issues/1627
