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

In root
```
yarn strapi build
yarn develop
yarn develop --watch-admin # Or this for hot reload
```

In `plugins/scaleflex-filerobot`  
`npm install`

## Todo

- Hooks 
	- https://strapi.io/blog/understanding-the-different-types-categories-of-strapi-hooks
	- https://discord.com/channels/811989166782021633/845300588312789063/952393677421039618
- Implement this https://forum.strapi.io/t/upload-image-url/3484/2
- Language Strings
	- https://docs.strapi.io/developer-docs/latest/plugins/i18n.html#getting-localized-entries-with-the-locale-parameter
	- https://strapi.io/blog/i18n-implementation-best-practices-in-strapi
- Update Strapi to v4 https://strapi.io/blog/v4-plugin-migration-guide

## Potential problems

- Localhost XAMPP, when `npm install`
	- https://developpaper.com/gyp-err-find-python-solution/
	- https://github.com/mapbox/node-sqlite3/issues/1424#issuecomment-934302012
	- Windows have problems installing strapi-plugin-upload > sharp > libvips . https://github.com/lovell/sharp/issues/1627

## Docs

- https://github.com/strapi/strapi/releases
- Support: https://discord.com/invite/strapi
- CMS: https://docs.strapi.io/developer-docs/latest/getting-started/quick-start.html
- Install: https://www.codegrepper.com/code-examples/shell/how+to+install+latest+version+of+strapi
- Plugin: 
	- https://strapi.io/blog/how-to-build-a-strapi-custom-plugin
	- https://strapi.io/blog/how-to-create-an-import-content-plugin-part-1-4
	- https://www.youtube.com/watch?v=kIZHzbmnhnU&t=960s
