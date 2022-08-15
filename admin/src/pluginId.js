const pluginPkg = require('../../package.json');

const pluginId = "scaleflex-filerobot".replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

module.exports = pluginId;
