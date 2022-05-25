# Strapi plugin scaleflexFilerobot

- Node v12.18.2
- Strapi v3.6.1
- Sqlite3 v5.0.0

## Server

- https://strapi.sfxconnector.com/
- `ssh root@strapi.sfxconnector.com -p8022`

## Setup Strapi v3.6.1

`npx create-strapi-app@3.6.1 scaleflex-strapi-filerobot --quickstart`

## Setup plugin

`yarn strapi generate:plugin scaleflexFilerobot`

## Run

In `plugins/scaleflex-filerobot`  
`npm install`

In root
```
yarn strapi build
yarn develop
yarn develop --watch-admin # Or this for hot reload
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

### Update plugin

Either via git or:

`scp -r -P 8022 ./scaleflex-filerobot root@strapi.sfxconnector.com:/var/www/scaleflex-strapi-filerobot/plugins`

#### Useful commands

- List all node processes: `ps -ef | grep node`
- Make background process: Use "screen". https://askubuntu.com/questions/8653/how-to-keep-processes-running-after-ending-ssh-session/8657#8657
- Kill background process: `pkill -9 {process ID}`. https://linuxhint.com/kill-background-process-linux/

## Usage

https://scaleflexhq.atlassian.net/wiki/spaces/FIL/pages/19104023/Strapi+Plugin

## Todo

- Hooks 
	- https://discord.com/channels/811989166782021633/845300588312789063/952393677421039618
- Have a table: image ID | local URL | FR URL
- Have sync status and trigger sync buttons
- Language Strings
	- https://strapi.io/blog/i18n-implementation-best-practices-in-strapi
	- https://discord.com/channels/811989166782021633/845300588312789063/952806377200422973
	- https://docs.strapi.io/developer-docs/latest/development/admin-customization.html#extending-translations
	- https://www.youtube.com/watch?v=bWyP1piDEcg
- CSS
- Messages
- Update Strapi from v3.6.1 to v4: 
    - CMS: 
        - https://discord.com/channels/811989166782021633/963236405641887744
        - https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html#v3-to-v4-migration-guide
    - Plugin: 
        - https://strapi.io/blog/v4-plugin-migration-guide
            - New: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.html
- IMPORTANT: Development of this plugin for Strapi v3.6.1 stops on 25/May/2022
	- This Filerobot plugin for Strapi v3.6.1 was never completed; Only the FMAW functionality was completed.
	- Development stuck on the 4 questions described in this ticket: https://sfx.li/C7xKUBqvA7Fzys
	- Continued development of this plugin will be in version 4: https://code.scaleflex.cloud/Dung0812/strapi-plugin-new/-/tree/plugin-v4

## Potential problems

- Localhost XAMPP, when `npm install`
	- https://developpaper.com/gyp-err-find-python-solution/
	- https://github.com/mapbox/node-sqlite3/issues/1424#issuecomment-934302012
	- Windows have problems installing strapi-plugin-upload > sharp > libvips . https://github.com/lovell/sharp/issues/1627

## Docs

- https://github.com/strapi/strapi/releases
- Support: https://discord.com/invite/strapi
- Tutorials: 
	- https://www.youtube.com/playlist?list=PL4cUxeGkcC9h6OY8_8Oq6JerWqsKdAPxn
	- https://www.youtube.com/playlist?list=PLjhq46XB5LWukdEt29lTaJl9XFG9CBMOp
- Plugin Tutorials: 
	- https://strapi.io/blog/how-to-create-an-import-content-plugin-part-1-4
	- https://www.youtube.com/watch?v=kIZHzbmnhnU&t=960s
	- https://docs-v3.strapi.io/developer-docs/latest/development/local-plugins-customization.html#front-end-development
