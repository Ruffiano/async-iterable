import { build } from "esbuild";

const buildConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
  }
  // esm browser
  build({
    ...buildConfig,
    platform: 'browser',
    format: 'esm',
    target: 'esnext',
    outfile: 'lib/browser/esm/index.js',
    tsconfig: './tsconfig.browser.json'
  }).catch(()=>process.exit(1))

  // cjs browser
  build({
    ...buildConfig,
    platform: 'browser',
    format: 'cjs',
    target: 'esnext',
    outfile: 'lib/browser/cjs/index.js',
    tsconfig: './tsconfig.browser.json'
  }).catch(()=>process.exit(1))
  
  // esm node
  build({
    ...buildConfig,
    platform: 'node',
    format: 'esm',
    target: 'node16',
    outfile: 'lib/node/esm/index.js',
    tsconfig: './tsconfig.node.json'
  }).catch(()=>process.exit(1))


  // comonjs node
  build({
    ...buildConfig,
    platform: 'node',
    format: 'cjs',
    target: 'node16',
    outfile: 'lib/node/cjs/index.js',
    tsconfig: './tsconfig.node.json'
  }).catch(()=>process.exit(1))