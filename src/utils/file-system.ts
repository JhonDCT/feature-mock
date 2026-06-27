import { select, isCancel, cancel, note } from '@clack/prompts'
import { fileSystemRepository, type FileSystemRepository } from '../clean/adapters/repositories/FileSystemRepository'
import { startMockServer } from '../server/mock-server'

const BACK_FEATURE = '__back_feature__'
const CHANGE_AC = '__change_ac__'

const toSelectOption = (value: string) => ({ value, label: value })
const backToFeaturesOption = { value: BACK_FEATURE, label: '← Back to features' }
const changeAcOption = { value: CHANGE_AC, label: '← Change acceptance criteria' }

const handleCancel = (): never => {
    cancel('Operation cancelled')
    process.exit(0)
}

const prompt = async (message: string, options: { value: string; label: string }[]): Promise<string> => {
    const selected = await select({ message, options })
    if (isCancel(selected)) handleCancel()
    return selected as string
}

const selectFeature = (repository: FileSystemRepository): Promise<string> =>
    repository.listsFeatures()
        .then(features => prompt('Select a feature:', features.map(toSelectOption)))

const selectAcceptanceCriteria = (repository: FileSystemRepository, feature: string): Promise<string> =>
    repository.listsAcceptanceCriteria(feature)
        .then(acs => prompt(
            `Select an acceptance criteria [${feature}]:`,
            [...acs.map(toSelectOption), backToFeaturesOption]
        ))

const showServerMenu = async (feature: string, ac: string, port: number): Promise<string> => {
    note(
        `http://localhost:${port}\n\nFeature : ${feature}\nScenario: ${ac}`,
        'Server running'
    )
    return prompt('What do you want to do?', [changeAcOption, backToFeaturesOption])
}

const navigateAcceptanceCriteria = async (repository: FileSystemRepository, feature: string): Promise<void> => {
    const ac = await selectAcceptanceCriteria(repository, feature)
    if (ac === BACK_FEATURE) return navigate(repository)

    const entries = await repository.loadResponses(feature, ac)
    const server = startMockServer(entries)

    const action = await showServerMenu(feature, ac, server.port)
    server.stop()

    return action === CHANGE_AC
        ? navigateAcceptanceCriteria(repository, feature)
        : navigate(repository)
}

const navigate = async (repository: FileSystemRepository): Promise<void> => {
    const feature = await selectFeature(repository)
    return navigateAcceptanceCriteria(repository, feature)
}

export function fileSystem() {
    const repository = fileSystemRepository()
    return {
        listsFeatures: () => navigate(repository)
    }
}
