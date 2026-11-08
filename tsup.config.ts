import { defineConfig } from 'tsup'

export default defineConfig([
    {
        entry: { index: 'src/index.ts' },
        format: 'esm',
        target: 'node20',
        platform: 'node',
        dts: true,
        clean: true,
    },
    {
        entry: { cli: 'bin/cli.ts' },
        format: 'esm',
        target: 'node20',
        platform: 'node',
    },
])
