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
const port = portFlagIndex !== -1
    ? Number(args[portFlagIndex + 1])
    : 3000;

if (portFlagIndex) setPort(port)

await startCommand()
