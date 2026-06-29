import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Dirent } from 'node:fs'

export type MockRequest = { method: string; path: string }
export type MockResponse = { status: number; body: unknown }
export type MockEntry = { request: MockRequest; response: MockResponse }
export type ResponsesSchema = { responses: MockEntry[] }

const MOCKS_DIR = resolve(process.cwd(), 'mocks')
const FEATURE_SUFFIX = '-feature'

const isFeatureDirectory = (entry: Dirent): boolean =>
    entry.isDirectory() && entry.name.endsWith(FEATURE_SUFFIX)

const isDirectory = (entry: Dirent): boolean => entry.isDirectory()

const readdirNames = (path: string, predicate: (e: Dirent) => boolean): Promise<string[]> =>
    readdir(path, { withFileTypes: true })
        .then(entries => entries.filter(predicate).map(e => e.name))

export const listsFeatures = (): Promise<string[]> =>
    readdirNames(MOCKS_DIR, isFeatureDirectory)

export const listsAcceptanceCriteria = (feature: string): Promise<string[]> =>
    readdirNames(resolve(MOCKS_DIR, feature), isDirectory)

export const loadResponses = (feature: string, ac: string): Promise<MockEntry[]> =>
    Bun.file(resolve(MOCKS_DIR, feature, ac, 'responses.json'))
        .json()
        .then((schema: ResponsesSchema) => schema.responses)
