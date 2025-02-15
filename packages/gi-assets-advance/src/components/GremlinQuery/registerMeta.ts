import { extra, utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';
const { GIAC_CONTENT_METAS, deepClone } = extra;
const metas = deepClone(GIAC_CONTENT_METAS);
metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.icon.default = info.icon;
metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.title.default = 'Gremlin';

const registerMeta = context => {
  const { services, engineId } = context;

  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);
  const { options: publishOptions, defaultValue: publishDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[1],
    engineId,
  );

  return {
    /** 分类信息 */
    serviceId: {
      title: $i18n.get({ id: 'advance.components.GremlinQuery.registerMeta.DataService', dm: '数据服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: options,
      },
      default: defaultValue,
    },
    isShowPublishButton: {
      title: $i18n.get({ id: 'advance.components.GremlinQuery.registerMeta.PublishAsATemplate', dm: '发布成模板' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      'x-reactions': [
        {
          target: 'saveTemplateServceId',
          fulfill: {
            state: {
              visible: '{{$self.value}}',
            },
          },
        },
      ],

      default: false,
    },
    saveTemplateServceId: {
      title: $i18n.get({
        id: 'advance.components.GremlinQuery.registerMeta.PublishTemplateService',
        dm: '发布模板服务',
      }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: publishOptions,
      },
      default: publishDefaultValue,
    },
    initialValue: {
      title: $i18n.get({ id: 'advance.components.GremlinQuery.registerMeta.InitialQuery', dm: '初始查询' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      default: 'g.V().hasLabel("Film").has("id","c54e6f7dd4dacc1ac5b0fa66565a4a60")',
    },
    height: {
      title: $i18n.get({ id: 'advance.components.GremlinQuery.registerMeta.Height', dm: '高度' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      default: 200,
    },
    ...metas,
  };
};

export default registerMeta;
