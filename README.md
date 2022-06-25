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
