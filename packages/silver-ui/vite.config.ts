import { defineConfig } from 'vite-plus';

// Build output, staged tooling, and generated source. `.ds-sync/` is the
// design-sync converter copied in verbatim; `ds-bundle/` is what it emits.
const GENERATED = [
  'dist/**',
  'node_modules/**',
  'src/logo-paths.ts',
  '.ds-sync/**',
  'ds-bundle/**',
  'demo/bundle.js',
];

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    deps: { neverBundle: ['react', 'react-dom', 'react/jsx-runtime'] },

    // Copied rather than imported from the entry: bundling inlines every
    // @import into one file, and the font URLs in brand/fonts/fonts.css are
    // relative to that directory, so inlining would break all of them.
    copy: [
      { from: '../../brand/tokens.css', to: 'dist' },
      { from: '../../brand/grain.png', to: 'dist' },
      { from: '../../brand/fonts/*', to: 'dist/fonts' },
      { from: 'src/components.css', to: 'dist' },
      { from: 'src/styles.css', to: 'dist' },
    ],
  },

  fmt: {
    singleQuote: true,
    ignorePatterns: GENERATED,
  },

  lint: {
    ignorePatterns: GENERATED,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
