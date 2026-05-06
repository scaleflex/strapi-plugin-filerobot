import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { getTranslation } from './utils/getTranslation';
import AssetPickerInput from './components/AssetPickerInput';

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Scaleflex DAM',
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.customFields.register({
      name: 'scaleflex-asset',
      pluginId: PLUGIN_ID,
      type: 'string',
      intlLabel: {
        id: `${PLUGIN_ID}.custom-fields.asset.label`,
        defaultMessage: 'Scaleflex Asset',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.custom-fields.asset.description`,
        defaultMessage: 'Pick an asset from Scaleflex DAM',
      },
      icon: PluginIcon,
      components: {
        Input: async () => ({ default: AssetPickerInput }),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: `${PLUGIN_ID}.custom-fields.asset.options.base.title`,
              defaultMessage: 'Asset options',
            },
            items: [
              {
                name: 'options.fileType',
                type: 'select',
                defaultValue: 'all',
                intlLabel: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.label`,
                  defaultMessage: 'Allowed file type',
                },
                description: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.description`,
                  defaultMessage: 'Restrict which type of assets can be selected',
                },
                options: [
                  {
                    key: 'all', value: 'all', metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.all`,
                        defaultMessage: "All",
                      },
                    }
                  },
                  {
                    key: 'image', value: 'image', metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.image`,
                        defaultMessage: "Image",
                      },
                    }
                  },
                  {
                    key: 'video', value: 'video', metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.video`,
                        defaultMessage: "Video",
                      },
                    }
                  },
                  {
                    key: 'audio', value: 'audio', metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.audio`,
                        defaultMessage: "Audio",
                      },
                    }
                  },
                  {
                    key: 'document', value: 'document', metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.fileType.document`,
                        defaultMessage: "Document",
                      },
                    }
                  }
                ],
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: null,
            items: [
              {
                name: 'options.attributes',
                type: 'text',
                intlLabel: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.attributes.label`,
                  defaultMessage: 'Stored attributes',
                },
                description: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.attributes.description`,
                  defaultMessage: 'Comma-separated asset fields to store alongside the URL (e.g. meta, info, tags, hash). Leave empty to store URL only.',
                },
              },
              {
                name: 'options.limit',
                type: 'number',
                intlLabel: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.limit.label`,
                  defaultMessage: 'Max assets',
                },
                description: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.limit.description`,
                  defaultMessage: 'Maximum number of assets to select (e.g. 1 for thumbnail, 10 for gallery). Leave empty for no limit.',
                },
              },
              {
                name: 'options.multiSelect',
                type: 'select',
                defaultValue: true,
                intlLabel: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.multiSelect.label`,
                  defaultMessage: 'Allow multiple selection',
                },
                description: {
                  id: `${PLUGIN_ID}.custom-fields.asset.options.multiSelect.description`,
                  defaultMessage: 'Let users select more than one asset at a time',
                },
                options: [
                  {
                    key: 'allow', value: true, metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.multiSelect.allow`,
                        defaultMessage: "Allow",
                      },
                    }
                  },
                  {
                    key: 'disallow', value: false, metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.custom-fields.asset.options.multiSelect.disallow`,
                        defaultMessage: "Disallow",
                      },
                    }
                  }
                ],
              },
            ],
          },
        ],
      },
    });
  },

  async registerTrads({ locales }) {
    const importedTranslations = await Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data: getTranslation(data), locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
    return importedTranslations;
  }
};
