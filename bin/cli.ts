#!/usr/bin/env bun
import pkg from '../package.json'
import { startCommand } from '../src/commands/start.command'
import { setPort } from '../src/services/mock-server'
import { bold, dim } from '../src/utils/colors'
import { setMocksDir } from '../src/utils/fs'

const HELP = `
${bold('feature-mock')} ${dim(`v${pkg.version}`)}
CLI mock server with a TUI for feature-driven development.

${bold('Usage')}
  feature-mock [mocks-dir] [options]

${bold('Options')}
  -d, --dir <path>     Path to the mocks folder (default: ./mocks)
  -p, --port <number>  Port for the mock server (default: 3000)
  -v, --version        Print the installed version
  -h, --help           Show this help

${bold('Examples')}
  feature-mock
  feature-mock ./path/to/mocks
  feature-mock --dir ./mocks --port 8080
`

const args = process.argv.slice(2)
const positionals: string[] = []
let dirFlag: string | undefined
let portFlag: string | undefined

for (let i = 0; i < args.length; i++) {
    const arg = args[i]!

    if (arg === '--help' || arg === '-h') {
        console.log(HELP)
        process.exit(0)
    } else if (arg === '--version' || arg === '-v') {
        console.log(pkg.version)
        process.exit(0)
    } else if (arg === '--dir' || arg === '-d') {
        dirFlag = args[++i]
    } else if (arg === '--port' || arg === '-p') {
        portFlag = args[++i]
    } else if (arg.startsWith('-')) {
        console.error(`Unknown option: ${arg}`)
        console.log(HELP)
        process.exit(1)
    } else {
        positionals.push(arg)
    }
}

const mocksPath = dirFlag ?? positionals[0]
if (mocksPath) setMocksDir(mocksPath)

if (portFlag !== undefined) {
    const port = Number(portFlag)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`Invalid port: ${portFlag || '(missing)'}`)
        process.exit(1)
    }
    setPort(port)
}

await startCommand()
