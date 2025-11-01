import dotenv from 'dotenv';
dotenv.config();

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import url from '@rollup/plugin-url';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';

// Check if we are in 'development' mode
const isDev = process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/embedpdf.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [
      copy({
        targets: [
          {
            src: 'src/index.html',
            dest: 'dist',
          },
          {
            src: 'node_modules/@embedpdf/pdfium/dist/*.wasm',
            dest: 'dist',
          },
          {
            src: 'demo-pdf/*.*',
            dest: 'dist',
          },
        ],
      }),
      url({
        include: ['**/*.svg'],
        limit: 8192,
      }),
      resolve({
        browser: true,
        dedupe: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'preact/compat',
          'preact/compat/jsx-runtime',
        ],
      }),
      commonjs(),
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
          { find: 'react-dom', replacement: 'preact/compat' },
          { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
        ],
      }),
      postcss({
        extract: false,
        modules: false,
        autoModules: false,
        minimize: false,
        inject: false,
        plugins: [autoprefixer(), tailwindcss()],
      }),
      typescript(),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
        babelrc: true,
      }),
      isDev &&
        serve({
          open: true,
          verbose: true,
          contentBase: ['dist'],
          historyApiFallback: true,
          host: 'localhost',
          port: 3020,
          headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Access-Control-Allow-Origin': '*',
          },
        }),
      terser({
        module: true,
        compress: isDev ? false : true,
      }),
      isDev &&
        livereload({
          watch: 'dist',
          verbose: false,
        }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }),
    ].filter(Boolean),
  },
];
