# Strapi v4 plugin for Filerobot by Scaleflex

## Intro

Strapi v4.x.x

To know which versions of Node goes with which versions of Strapi, refer to here: https://github.com/strapi/strapi/releases

If you are not familiar with using the Strapi CMS, here are some quick tutorials:

Strapi v4: https://docs.strapi.io/developer-docs/latest/getting-started/quick-start.html

## Install Strapi CMS

You can run, for example: `npx create-strapi-app@4.3.0`

## Plugin

https://www.npmjs.com/package/@filerobot-strapi/content-plugin

At this point, assuming that you already have a Strapi CMS installed and set up, and that you already have a super-admin user configured. It's time to install the Scaleflex Filerobot plugin for Strapi v4:

`npm install @filerobot-strapi/content-plugin`

(Use `npm install @filerobot-strapi/content-plugin --legacy-peer-deps` if you need to)

## Run

`yarn build`

`yarn start`

## Configure

Click "Filerobot by Scaleflex" on the left vertical menu (under the plugins section)

![image](https://user-images.githubusercontent.com/20809372/210230101-1740f1c5-9491-4391-b28c-db3a729d0d3d.png)

- **CNAME** should be without `https://`
- **Folder** can have a preceding `/` , but it's not necessary. So both `/folder_name` and `folder_name` are ok

## Usage

Now you can make use of the "Synchronization Status" and "Trigger Synchronization" buttons.

### Media Tab

![image](https://user-images.githubusercontent.com/20809372/210230292-c9c90b68-a311-4981-977b-3b9802ea5243.png)

The **Media Tab** keeps a "log" of all your media assets.

Note: when provider is local, the **Hash** is like a "unique name" generated by Strapi, and the **Alt** is like an "alternative name" generated by Strapi.

Indeed, there are 2 local images that are yet to be synchronized to the Filerobot platform.

![](https://opendocs-global.airstore.io/d82bf1f9bbda471f279c22d95d7d695012095a0d0b6d9c53dc64f7a562f9b1af.png)

And there are indeed 4 remote images on the **Filerobot platform** that are yet to be synchronized down to the Strapi CMS.

### Trigger Synchronization

![image](https://user-images.githubusercontent.com/20809372/210230408-8d37d416-5a64-4986-8b42-6575c4564ed7.png)

Afterwards, the logs will be updated:

![](https://store.filerobot.com/opendocs-global/ffe8b5a749a10c1e8cb426854d86b00addded6aaa99584ac0a751f6f2a1aec9b.png)

Note: when `provider` is `filerobot`, the **Hash** is Filerobot's `file -> hash -> sha1`, and the **Alt** is Filerobot's `file -> uuid`.

## FMAW Tab

When you **Upload**, the image will be uploaded to the Filerobot platform. Also, the same image (with Filerobot's URL) will go into the Strapi CMS:

![](https://store.filerobot.com/opendocs-global/38020c7d81a7cb3b77935806f291d101a37cb3a364d1594d87a07a0d1ca8778c.png)

If you know that `eye.jpg` only exists on the Filerobot platform (ie: haven't yet been synchronized down to the Strapi CMS), then you can check it and press "**Add to Strapi**":

![](https://store.filerobot.com/opendocs-global/23f21c7e73c0940041ba24a6c80ff9e43f72f61b203f2cacd02cfde6b4549ab5.png)

## REST API

**Give the appropriate permissions to the authenticated user**

![](https://store.filerobot.com/opendocs-global/project_test/113df0317493b932791a716f3e0962d92a26211e42110fdb248d6046507c92e1.png)

**Get the auth token**

https://www.youtube.com/watch?v=TIK9CYDgs5k&list=PL2dKqfImstaROBMu304aaEfIVTGodkdHh&index=3 (even though this tutorial is for Strapi v3, it's still applicable to Strapi v4)

```
curl --location --request POST '{domain}/api/auth/local' 
--form 'identifier="{an authenticated user's email}"' \
--form 'password="{an authenticated user's password'}"'
```

**Retrieve Media**

https://docs.strapi.io/developer-docs/latest/plugins/upload.html#endpoints

GET all media

```
curl --location --request GET '{domain}/api/upload/files' \
--header 'Authorization: Bearer {token}'
```

GET one media

```
curl --location --request GET '{domain}/api/upload/files/3' \
--header 'Authorization: Bearer {token}'
```

**Retrieve custom content-types**

https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html

GET collection-type contents

```
curl --location --request GET '{domain}/api/tests' \
--header 'Authorization: Bearer {token}'
```

GET one collection-type content

```
curl --location --request GET '{domain}/api/tests/1' \
--header 'Authorization: Bearer {token}'
```

Note: If your content-type contains Media fields, then you have to append this query parameter for media info to show `?populate=%2A`

https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html#population
