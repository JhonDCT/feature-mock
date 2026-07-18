import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
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

const readResponsesFile = (...segments: string[]): Promise<MockEntry[]> =>
    readFile(resolve(mocksDir, ...segments, 'responses.json'), 'utf-8')
        .then(text => (JSON.parse(text) as ResponsesSchema).responses)

const loadSharedResponses = (): Promise<MockEntry[]> =>
    readResponsesFile(SHARED_DIR).catch(() => [])

const sameEndpoint = (a: MockEntry, b: MockEntry): boolean =>
    a.request.method === b.request.method && a.request.path === b.request.path

export const loadResponses = async (feature: string, ac: string): Promise<MockEntry[]> => {
    const acEntries = await readResponsesFile(feature, ac).catch(() => {
        throw new Error('Not found responses.json file')
    })
    const sharedEntries = await loadSharedResponses()

    return [
        ...acEntries,
        ...sharedEntries.filter(shared => !acEntries.some(entry => sameEndpoint(entry, shared))),
    ]
}
