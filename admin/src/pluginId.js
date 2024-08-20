const pluginPkg = require('../../package.json');

const pluginId = "scaleflex-dam".replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

module.exports = pluginId;
