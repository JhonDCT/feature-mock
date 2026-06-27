import type { FileSystemRepo } from "../repositories/FileSystemRepository";

export interface ListFeaturesController {
    execute(): Promise<string[]>;
}

export function listFeaturesController(
    fileSystem: FileSystemRepo
): ListFeaturesController {
    return {
        execute: () => {
            const MOCKS_DIR = 'mocks'
            const FEATURE_SUFFIX = '-feature'

            const isFeatureDirectory = (entry: any): boolean =>
                entry.isDirectory() && entry.name.endsWith(FEATURE_SUFFIX)

            return fileSystem.readdirName(MOCKS_DIR, isFeatureDirectory)
        }
    }
}
