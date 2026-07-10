import { createServer } from 'node:http'
import type { MockEntry } from '../utils/fs'

let PORT = 3000

export type MockServer = { port: number; stop: () => void }

export const setPort = (port: number): void => {
    PORT = port
}

const findMock = (entries: MockEntry[], method: string, pathname: string): MockEntry | undefined =>
    entries.find(e => e.request.method === method && e.request.path === pathname)

export const startMockServer = (entries: MockEntry[]): MockServer => {
    const server = createServer((req, res) => {
        const { pathname } = new URL(req.url!, `http://localhost:${PORT}`)
        const mock = findMock(entries, req.method!, pathname)

        if (!mock) {
            res.writeHead(404)
            res.end('Not found')
            return
        }

        res.writeHead(mock.response.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(mock.response.body))
    })

    server.listen(PORT)

    return {
        port: PORT,
        stop: () => server.close()
    }
}
