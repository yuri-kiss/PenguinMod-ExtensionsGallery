import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { transformSync } from '@babel/core';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

function buildExtensions() {
  const extensionFiles = glob.sync('src/babeld-extensions/**/*.js');
  
  return {
    name: 'pm-build-extensions',

    enforce: 'post',

    configResolved: (config) => {
      config.build.rollupOptions.input = Object.assign(
        Object.fromEntries(extensionFiles.map((file) => [path.file, file])),
        config.build.rollupOptions.input,
      );

      return config;
    },

    transform(code, file) {
      if (!extensionFiles.includes(file)) {
        return;
      }

      code = transformSync(code, {
        assumptions: {
          constantReexports: true,
          constantSuper: true,
          ignoreFunctionLength: true,
          ignoreToPrimitiveHint: true,
          noClassCalls: true,
          noDocumentAll: true,
          noNewArrows: true,
          objectRestNoSymbols: true,
          pureGetters: true,
        },
        presets: [
          ['@babel/preset-env'],
        ],
        plugins: [],
        targets: [
          'chrome >= 70',
          'chromeandroid >= 70',
          'edge >= 17',
          'firefox >= 68'
        ],
        sourceType: 'script',
        filename: file,
      }).code;
      
      return `void !function() {\n  'use strict';\n${code}\n}();`;
    },
  };
}

export default defineConfig({
	plugins: [
    sveltekit(),
    buildExtensions(),
  ],
});
