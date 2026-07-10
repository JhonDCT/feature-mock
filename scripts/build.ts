import { $ } from 'bun'

await $`mkdir -p dist`

await Promise.all([
    $`bun build src/index.ts  --outfile dist/index.js --target node`,
    $`bun build bin/cli.ts    --outfile dist/cli.js   --target node`,
])

const cli = await Bun.file('dist/cli.js').text()
const shebang = '#!/usr/bin/env node\n'
const body = cli.startsWith('#!') ? cli.replace(/^#!.*\n/, '') : cli
await Bun.write('dist/cli.js', shebang + body)
await $`chmod +x dist/cli.js`

console.log('Build complete → dist/')
