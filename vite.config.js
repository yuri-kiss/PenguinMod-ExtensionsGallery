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
    generateBundle(_options, _bundle) {
      extensionFiles.forEach(file => {
        const code = transformSync(fs.readFileSync(file, 'utf-8'), {
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
        
        const outputName = path.relative('src/babeld-extensions', file);
        this.emitFile({
          type: 'asset',
          fileName: `extensions/${outputName}`,
          source: `void !function() {\n  'use strict';\n${code}\n}();`,
        });
      });
    },
  };
}

export default defineConfig({
	plugins: [
    buildExtensions(),
    sveltekit(),
  ],
});
