import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'jsx-runtime': 'src/jsx-runtime.ts',
        'cli/index': 'src/cli/index.ts',
        'profiles/engie/index': 'src/profiles/engie/index.ts',
    },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    splitting: false,
    sourcemap: true,
    clean: true,
    tsconfig: 'tsconfig.build.json',
    dts: {
        entry: {
            index: 'src/index.ts',
            'jsx-runtime': 'src/jsx-runtime.ts',
            'profiles/engie/index': 'src/profiles/engie/index.ts',
        },
    },
    // These are resolved at runtime by the CLI/host, not bundled into the lib.
    external: ['vite', '@preact/preset-vite', 'vite-plugin-singlefile', 'playwright'],
    // Ship the raw CSS/asset files next to the bundle.
    loader: {
        '.css': 'copy',
        '.svg': 'dataurl',
    },
})
