# Strapi plugin scaleflexFilerobot

- Node v12.18.2 (any version from 12 to 14 is ok)
- Strapi v3.6.1
- Sqlite3 v5.0.0

## Full details 

https://scaleflexhq.atlassian.net/wiki/spaces/FIL/pages/19104023/Strapi+Plugin

## Note

In the past, the root folder contains a file called `server.js`
```js
const strapi = require('strapi');

strapi(/* {...} */).start();
```
The serving background process was created by running: `node /var/www/scaleflex-strapi-filerobot/server.js`.  
However, now that's unnecessary, because we can just run: `yarn develop`.

## Potential problems

- Localhost XAMPP, when `npm install`
	- https://developpaper.com/gyp-err-find-python-solution/
	- https://github.com/mapbox/node-sqlite3/issues/1424#issuecomment-934302012
	- Windows have problems installing strapi-plugin-upload > sharp > libvips . https://github.com/lovell/sharp/issues/1627

## Todo

- Language https://discord.com/channels/811989166782021633/845300588312789063/1003939483718254663
