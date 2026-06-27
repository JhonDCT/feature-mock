import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Dirent } from 'node:fs'
import type { MockEntry, ResponsesSchema } from '../../core/entities/MockResponse'

const MOCKS_DIR = resolve(process.cwd(), 'mocks')
const FEATURE_SUFFIX = '-feature'

const isDirectory = (entry: Dirent): boolean => entry.isDirectory()

const isFeatureDirectory = (entry: Dirent): boolean =>
    isDirectory(entry) && entry.name.endsWith(FEATURE_SUFFIX)

const toName = (entry: Dirent): string => entry.name

const readdirNames = (path: string, predicate: (e: Dirent) => boolean): Promise<string[]> =>
    readdir(path, { withFileTypes: true })
        .then(entries => entries.filter(predicate).map(toName))

const responsesPath = (feature: string, ac: string): string =>
    resolve(MOCKS_DIR, feature, ac, 'responses.json')

export interface FileSystemRepository {
    listsFeatures(): Promise<string[]>
    listsAcceptanceCriteria(feature: string): Promise<string[]>
    loadResponses(feature: string, ac: string): Promise<MockEntry[]>
}

export interface FileSystemRepo {
    readdirName(path: string, predicate: (e: Dirent) => boolean): Promise<string[]>;
}

export function fileSystemRepository(): FileSystemRepository {
    return {
        listsFeatures: () =>
            readdirNames(MOCKS_DIR, isFeatureDirectory),
        // listsFeatures: () => listFeaturesController(),

        listsAcceptanceCriteria: (feature: string) =>
            readdirNames(resolve(MOCKS_DIR, feature), isDirectory),

        loadResponses: (feature: string, ac: string) =>
            Bun.file(responsesPath(feature, ac))
                .json()
                .then((schema: ResponsesSchema) => schema.responses)
    }
}