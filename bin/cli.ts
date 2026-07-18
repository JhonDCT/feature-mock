#!/usr/bin/env bun
import { startCommand } from '../src/commands/start.command'
import { setPort } from '../src/services/mock-server'
import { setMocksDir } from '../src/utils/fs'

const args = process.argv.slice(2)
const dirFlagIndex = args.findIndex(a => a === '--dir' || a === '-d')
const mocksPath = dirFlagIndex !== -1
    ? args[dirFlagIndex + 1]
    : args.find(a => !a.startsWith('-'))

if (mocksPath) setMocksDir(mocksPath)

const portFlagIndex = args.findIndex(a => a === '--port' || a === '-p')

if (portFlagIndex !== -1) {
    const port = Number(args[portFlagIndex + 1])
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`Invalid port: ${args[portFlagIndex + 1] ?? '(missing)'}`)
        process.exit(1)
    }
    setPort(port)
}

await startCommand()
