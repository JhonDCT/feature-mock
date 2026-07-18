import { createServer } from 'node:http'
import type { MockEntry } from '../utils/fs'

let PORT = 3000

export type MockServer = { port: number; stop: () => void }

export const setPort = (port: number): void => {
    PORT = port
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
}

const findMock = (entries: MockEntry[], method: string, pathname: string): MockEntry | undefined =>
    entries.find(e => e.request.method === method && e.request.path === pathname)

export const startMockServer = (entries: MockEntry[]): MockServer => {
    const server = createServer((req, res) => {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, CORS_HEADERS)
            res.end()
            return
        }

        const { pathname } = new URL(req.url!, `http://localhost:${PORT}`)
        const mock = findMock(entries, req.method!, pathname)

        if (!mock) {
            res.writeHead(404, CORS_HEADERS)
            res.end('Not found')
            return
        }

        res.writeHead(mock.response.status, { 'Content-Type': 'application/json', ...CORS_HEADERS })
        res.end(JSON.stringify(mock.response.body))
    })

    server.listen(PORT)

    return {
        port: PORT,
        stop: () => server.close()
    }
}
