import LZString from 'lz-string';
import { useEffect, useState } from 'react';
import { beautifyCode, getConstantFiles, HTML_SCRIPTS, MY_GRAPH_SDK } from './common';
import $i18n from '../i18n';

const CSB_API_ENDPOINT = 'https://codesandbox.io/api/v1/sandboxes/define';

function serialize(data: Record<string, any>) {
  return LZString.compressToBase64(JSON.stringify(data))
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='
}

function getCSBData(opts) {
  const ext = '.tsx';
  const files: Record<string, { content: string }> = {};

  const entryFileName = `src/index${ext}`;

  const { GI_PROJECT_CONFIG, SERVER_ENGINE_CONTEXT, GI_ASSETS_PACKAGE, HTML_HEADER, THEME_STYLE } =
    getConstantFiles(opts);

  /** G6VP 站点图数据和 Schema 信息 **/
  const { data, schemaData } = window['LOCAL_DATA_FOR_GI_ENGINE'];
  const formatData = beautifyCode(JSON.stringify(data));
  const formatSchemaData = beautifyCode(JSON.stringify(schemaData));

  files['src/GI_EXPORT_FILES.ts'] = {
    content: $i18n.get(
      {
        id: 'gi-site.src.hooks.useCodeSandbox.SupportingAssetsRequiredForDynamic',
        dm: " \n      /** 动态请求需要的配套资产 **/\n      export const GI_ASSETS_PACKAGE = {GIASSETSPACKAGE}\n\n      /** G6VP 站点自动生成的配置 **/\n      export const GI_PROJECT_CONFIG = {GIPROJECTCONFIG};\n      \n      /** G6VP 站点选择服务引擎的上下文配置信息 **/\n      export const SERVER_ENGINE_CONTEXT = {SERVERENGINECONTEXT};\n\n      window['LOCAL_DATA_FOR_GI_ENGINE'] = {\n        data: {formatData},\n        schemaData: {formatSchemaData},\n      };\n    ",
      },
      {
        GIASSETSPACKAGE: GI_ASSETS_PACKAGE,
        GIPROJECTCONFIG: GI_PROJECT_CONFIG,
        SERVERENGINECONTEXT: SERVER_ENGINE_CONTEXT,
        formatData: formatData,
        formatSchemaData: formatSchemaData,
      },
    ),
  };

  files['src/index.tsx'] = {
    content: $i18n.get(
      {
        id: 'gi-site.src.hooks.useCodeSandbox.AvoidConflictsBetweenMultipleVersions',
        dm: '\n    // 因为没有做 external，避免多个版本react冲突，统一从window对象中获取\n    // import React from "react"\n    // import ReactDOM from "react-dom";\n\n    import {  GI_PROJECT_CONFIG, SERVER_ENGINE_CONTEXT,GI_ASSETS_PACKAGE } from "./GI_EXPORT_FILES";\n\n    {MYGRAPHSDK}\n    ',
      },
      { MYGRAPHSDK: MY_GRAPH_SDK },
    ),
  };

  files['package.json'] = {
    content: JSON.stringify(
      {
        name: '',
        description: '',
        main: entryFileName,
        dependencies: {},
        devDependencies: { typescript: '^3' },
      },
      null,
      2,
    ),
  };

  files['public/index.html'] = {
    content: `
    <!DOCTYPE html >
    <html lang="en" ${THEME_STYLE}>
    ${HTML_HEADER}
      <body>
        <div id="root"></div>
        <!--- REACT DEPENDENCIES-->
      ${HTML_SCRIPTS}
        </body>
    </html>
  `,
  };

  return serialize({ files });
}

export default opts => {
  const [handler, setHandler] = useState<(...args: any) => void | undefined>();

  useEffect(() => {
    if (opts) {
      const form = document.createElement('form');
      const input = document.createElement('input');
      const data = getCSBData(opts);

      form.method = 'POST';
      form.target = '_blank';
      form.style.display = 'none';
      form.action = CSB_API_ENDPOINT;
      form.appendChild(input);
      form.setAttribute('data-demo', opts.title || '');

      input.name = 'parameters';
      input.value = data;

      document.body.appendChild(form);

      setHandler(() => () => form.submit());

      return () => form.remove();
    }
  }, [opts]);

  return handler;
};
