import type { Dirent } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type MockRequest = { method: string; path: string }
export type MockResponse = { status: number; body: unknown }
export type MockEntry = { request: MockRequest; response: MockResponse }
export type ResponsesSchema = { responses: MockEntry[] }

const FEATURE_SUFFIX = '-feature'
const SHARED_DIR = 'shared'

let mocksDir = resolve(process.cwd(), 'mocks')

export const setMocksDir = (dir: string): void => {
    mocksDir = resolve(dir)
}

export const getMocksDir = (): string => mocksDir

const isFeatureDirectory = (entry: Dirent): boolean =>
    entry.isDirectory() && entry.name.endsWith(FEATURE_SUFFIX)

const isDirectory = (entry: Dirent): boolean => entry.isDirectory()

const readdirNames = (path: string, predicate: (e: Dirent) => boolean): Promise<string[]> =>
    readdir(path, { withFileTypes: true })
        .then(entries => entries.filter(predicate).map(e => e.name))

export const listsFeatures = (): Promise<string[]> =>
    readdirNames(mocksDir, isFeatureDirectory)

export const listsAcceptanceCriteria = (feature: string): Promise<string[]> =>
    readdirNames(resolve(mocksDir, feature), isDirectory)

export class MissingResponsesError extends Error {}

const readResponsesFile = async (...segments: string[]): Promise<MockEntry[]> => {
    const path = resolve(mocksDir, ...segments, 'responses.json')

    const text = await readFile(path, 'utf-8').catch(() => {
        throw new MissingResponsesError(`Missing responses.json at ${path}`)
    })

    let schema: ResponsesSchema
    try {
        schema = JSON.parse(text) as ResponsesSchema
    } catch {
        throw new Error(`Invalid JSON in ${path}`)
    }

    if (!Array.isArray(schema.responses)) {
        throw new Error(`Invalid schema in ${path}: expected { "responses": [...] }`)
    }

    return schema.responses
}

const loadSharedResponses = (): Promise<MockEntry[]> =>
    readResponsesFile(SHARED_DIR).catch(error =>
        error instanceof MissingResponsesError ? [] : Promise.reject(error))

const sameEndpoint = (a: MockEntry, b: MockEntry): boolean =>
    a.request.method === b.request.method && a.request.path === b.request.path

export const loadResponses = async (feature: string, ac: string): Promise<MockEntry[]> => {
    const acEntries = await readResponsesFile(feature, ac)
    const sharedEntries = await loadSharedResponses()

    return [
        ...acEntries,
        ...sharedEntries.filter(shared => !acEntries.some(entry => sameEndpoint(entry, shared))),
    ]
}

const EXAMPLE_MOCKS: [string[], ResponsesSchema][] = [
    [[SHARED_DIR], {
        responses: [
            { request: { method: 'GET', path: '/api/health' }, response: { status: 200, body: { status: 'ok' } } },
        ],
    }],
    [['example-feature', 'ac-01-example-successfully'], {
        responses: [
            { request: { method: 'GET', path: '/api/example' }, response: { status: 200, body: { message: 'Hello from feature-mock' } } },
        ],
    }],
]

export const createExampleMocks = async (): Promise<void> => {
    for (const [segments, schema] of EXAMPLE_MOCKS) {
        const dir = resolve(mocksDir, ...segments)
        await mkdir(dir, { recursive: true })
        await writeFile(resolve(dir, 'responses.json'), `${JSON.stringify(schema, null, 2)}\n`)
    }
}
