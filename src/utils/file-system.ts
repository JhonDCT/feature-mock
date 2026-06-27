import { select, isCancel, cancel, intro, log, box, spinner } from '@clack/prompts'
import { fileSystemRepository, type FileSystemRepository } from '../clean/adapters/repositories/FileSystemRepository'
import { startMockServer } from '../server/mock-server'
import type { MockEntry } from '../clean/core/entities/MockResponse'

const BACK_FEATURE = '__back_feature__'
const CHANGE_AC = '__change_ac__'

const toSelectOption = (value: string) => ({ value, label: value })

const backToFeaturesOption = { value: BACK_FEATURE, label: '← Back to features' }
const changeAcOption = {
    value: CHANGE_AC,
    label: '← Change acceptance criteria',
    hint: 'Restart server with a different scenario',
}

const handleCancel = (): never => {
    cancel('Operation cancelled. Server stopped.')
    process.exit(0)
}

const prompt = async (message: string, options: { value: string; label: string; hint?: string }[]): Promise<string> => {
    const selected = await select({ message, options })
    if (isCancel(selected)) handleCancel()
    return selected as string
}

const pluralize = (n: number, word: string): string => `${n} ${word}${n !== 1 ? 's' : ''}`

const formatEndpoint = (entry: MockEntry): string =>
    `${entry.request.method.padEnd(7)}${entry.request.path.padEnd(30)}→  ${entry.response.status}`

const formatEndpoints = (entries: MockEntry[]): string =>
    entries.map(formatEndpoint).join('\n')

const selectFeature = async (repository: FileSystemRepository): Promise<string> => {
    const features = await repository.listsFeatures()
    return prompt('Select a feature:', features.map(toSelectOption))
}

const selectAcceptanceCriteria = async (repository: FileSystemRepository, feature: string): Promise<string> => {
    const acs = await repository.listsAcceptanceCriteria(feature)
    return prompt(
        `Select a scenario  [${feature}]:`,
        [...acs.map(toSelectOption), backToFeaturesOption],
    )
}

const loadWithSpinner = async (repository: FileSystemRepository, feature: string, ac: string): Promise<MockEntry[]> => {
    const spin = spinner()
    spin.start('Loading responses...')
    const entries = await repository.loadResponses(feature, ac)
    spin.stop(`Loaded ${pluralize(entries.length, 'endpoint')}`)
    return entries
}

const showServerBox = (feature: string, ac: string, port: number, entries: MockEntry[]): void =>
    box(
        `http://localhost:${port}\n\nFeature : ${feature}\nScenario: ${ac}\n\nEndpoints:\n${formatEndpoints(entries)}`,
        'Server running',
        { contentAlign: 'left' }
    )

const navigateAcceptanceCriteria = async (repository: FileSystemRepository, feature: string): Promise<void> => {
    const ac = await selectAcceptanceCriteria(repository, feature)
    if (ac === BACK_FEATURE) return navigate(repository)

    const entries = await loadWithSpinner(repository, feature, ac)

    const server = startMockServer(entries)
    log.success(`Server started  →  http://localhost:${server.port}`)

    showServerBox(feature, ac, server.port, entries)

    const action = await prompt('What do you want to do?', [changeAcOption, backToFeaturesOption])

    server.stop()
    log.step('Server stopped')

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
        listsFeatures: async () => {
            intro('Feature Mock Server')
            await navigate(repository)
        }
    }
}
