import type { FileSystemRepository } from "../../adapters/repositories/FileSystemRepository";

export class LoadMocksFromFolder {
    constructor(
        private fileSystem: FileSystemRepository 
    ) {}

    execute(): void {
        this.fileSystem.listsFeatures();
    }
}