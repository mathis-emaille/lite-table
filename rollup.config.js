import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/lite-table.js',
      format: 'umd',
      name: 'LiteTable',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      postcss({
        extract: 'style.css',
        minimize: true
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/lite-table.min.js',
      format: 'umd',
      name: 'LiteTable',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      postcss({
        extract: 'style.min.css',
        minimize: true
      }),
      terser()
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      postcss({
        inject: false,
        extract: 'style.esm.css'
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      postcss({
        inject: false,
        extract: 'style.cjs.css'
      })
    ]
  }
];