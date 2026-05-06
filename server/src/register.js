const register = ({ strapi }) => {
  strapi.customFields.register({
    name: 'scaleflex-asset',
    plugin: 'scaleflex-dam',
    type: 'string',
  });
};

export default register;
