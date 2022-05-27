# Strapi plugin scaleflexFilerobot

- Node v14.0.0
- Strapi v4.1.0
- Sqlite3 v5.0.2

## Server

- https://strapi.sfxconnector.com/
- `ssh root@strapi.sfxconnector.com -p8022`

## Setup Strapi v4

`yarn create strapi-app scaleflex-filerobot`

- https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/cli.html#creating-a-strapi-project
- Can also install like these: https://www.codegrepper.com/code-examples/shell/how+to+install+latest+version+of+strapi

## Setup plugin

1. `npm run strapi generate`
2. Chose "plugin"
3. Name the plugin.

https://strapi.io/blog/how-to-create-a-strapi-v4-plugin

Remember to create `{CMS root folder}/config/plugins.js`

```js
module.exports = {
  // ...
  'scaleflex-filerobot': {
    enabled: true,
    resolve: "./src/plugins/scaleflex-filerobot", // Folder of your plugin
  },
  // ...
};
```

## Run

In `plugins/scaleflex-filerobot`  
`npm install`

In root
```
yarn strapi build
yarn start # No hot reload
yarn develop # With hot reload
```

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
	- https://strapi.io/blog/understanding-the-different-types-categories-of-strapi-hooks
	- https://discord.com/channels/811989166782021633/845300588312789063/952393677421039618
- Have a table: image ID | local URL | FR URL
- Have sync status and trigger sync buttons
- Language Strings
	- https://docs.strapi.io/developer-docs/latest/plugins/i18n.html#getting-localized-entries-with-the-locale-parameter
	- https://discord.com/channels/811989166782021633/845300588312789063/952806377200422973
	- https://docs.strapi.io/developer-docs/latest/development/admin-customization.html#extending-translations
	- https://www.youtube.com/watch?v=bWyP1piDEcg
	- https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#locale
- CSS
- Messages

## Docs

- https://github.com/strapi/strapi/releases
- Support: https://discord.com/invite/strapi
- Quickstart: https://docs.strapi.io/developer-docs/latest/getting-started/quick-start.html
- Tutorials: 
	- https://www.youtube.com/watch?v=vcopLqUq594
	- https://www.youtube.com/playlist?list=PL7Q0DQYATmvjJyxrLw0xCOKwjv8Bh7yLx
- Plugin Tutorials: 
	- https://www.youtube.com/playlist?list=PL7Q0DQYATmvjd5D57P8CN0_xp_HsRd3wn
	- https://strapi.io/plugin-resources
  - https://docs.strapi.io/developer-docs/latest/development/plugins-development.html
  - https://strapi.io/blog/how-to-create-a-strapi-v4-plugin
	- https://strapi.io/blog/how-to-build-a-strapi-custom-plugin
	- https://strapi.io/blog/how-to-create-a-strapi-v4-plugin-generate-a-plugin-1-6
- DB: 
	- https://strapi.io/blog/using-database-transactions-to-write-queries-in-strapi
	- https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html
		- https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.html
- Auth
	- https://www.youtube.com/watch?v=TIK9CYDgs5k&list=PL2dKqfImstaROBMu304aaEfIVTGodkdHh&index=3 (v3, but still applicable to v4)
	- https://www.youtube.com/watch?v=EjBpJuqqi3U (v3, but still applicable to v4)
	- https://www.youtube.com/watch?v=xv5TWP3tCKs (v3, but still applicable to v4)
	- https://forum.strapi.io/t/retrieve-user-details/5082/2 (v3, but still applicable to v4)
	- https://strapi.io/blog/a-beginners-guide-to-authentication-and-authorization-in-strapi
		- https://www.youtube.com/watch?v=vcopLqUq594&t=4336s
