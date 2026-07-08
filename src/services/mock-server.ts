import type { MockEntry } from '../utils/fs'

let PORT = 3000

export type MockServer = { port: number; stop: () => void }

export const setPort = (port: number): void => {
    PORT = port
}

const findMock = (entries: MockEntry[], method: string, pathname: string): MockEntry | undefined =>
    entries.find(e => e.request.method === method && e.request.path === pathname)

const handleRequest = (entries: MockEntry[]) => (req: Request): Response => {
    const { pathname } = new URL(req.url)

    const mock = findMock(entries, req.method, pathname)
    if (!mock) return new Response('Not found', { status: 404 })

    return Response.json(mock.response.body, { status: mock.response.status })
}

export const startMockServer = (entries: MockEntry[]): MockServer => {
    const server = Bun.serve({
        port: PORT,
        fetch: handleRequest(entries)
    })

    return {
        port: server.port ?? PORT,
        stop: () => server.stop()
    }
}
