import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type MockRequest = { method: string; path: string }
export type MockResponse = { status: number; body: unknown }
export type MockEntry = { request: MockRequest; response: MockResponse }
export type ResponsesSchema = { responses: MockEntry[] }

const FEATURE_SUFFIX = '-feature'

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

export const loadResponses = (feature: string, ac: string): Promise<MockEntry[]> =>
    readFile(resolve(mocksDir, feature, ac, 'responses.json'), 'utf-8')
        .then(text => (JSON.parse(text) as ResponsesSchema).responses)
        .catch(() => {
            throw new Error('Not found responses.json file')
        })
