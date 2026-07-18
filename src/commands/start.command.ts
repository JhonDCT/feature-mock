import { cancel, confirm, intro, isCancel, note, outro } from '@clack/prompts'
import type { MockServer } from '../services/mock-server'
import { startMockServer } from '../services/mock-server'
import { setActiveScenario, setActiveServer, stopActiveServer } from '../services/state-manager'
import { showServerBox } from '../ui/components'
import {
    BACK_FEATURE,
    CHANGE_AC,
    EXIT,
    RELOAD,
    backToFeaturesOption,
    changeAcOption,
    exitOption,
    loadWithSpinner,
    prompt,
    promptAcceptanceCriteria,
    promptFeature,
    reloadOption,
} from '../ui/prompts'
import { bold, dim } from '../utils/colors'
import type { MockEntry } from '../utils/fs'
import { createExampleMocks, getMocksDir, listsFeatures } from '../utils/fs'
import { logger } from '../utils/logger'

const EXPECTED_STRUCTURE = `mocks/
├── shared/                  (optional, common endpoints)
│   └── responses.json
└── my-feature/              (must end with "-feature")
    └── ac-01-scenario/
        └── responses.json`

const exitCli = (): void => {
    stopActiveServer()
    outro('Server stopped. See you! 👋')
}

const ensureFeatures = async (): Promise<boolean> => {
    const features = await listsFeatures().catch(() => null)
    if (features?.length) return true

    note(EXPECTED_STRUCTURE, features === null
        ? `Mocks directory not found: ${getMocksDir()}`
        : `No "*-feature" folders found in ${getMocksDir()}`)

    const create = await confirm({ message: 'Create an example mocks structure to get started?' })

    if (isCancel(create) || !create) {
        outro('Add a mocks folder and run feature-mock again.')
        return false
    }

    await createExampleMocks()
    logger.success(`Example mocks created in ${getMocksDir()}`)

    return true
}

const runScenario = async (feature: string, ac: string): Promise<void> => {
    let entries: MockEntry[]
    let server: MockServer

    try {
        entries = await loadWithSpinner(feature, ac)
        server = await startMockServer(entries)
    } catch (error) {
        logger.warn((error as Error).message)
        return navigateAcceptanceCriteria(feature)
    }

    setActiveScenario(feature, ac)
    setActiveServer(server)
    logger.success(`Server started  →  ${bold(`http://localhost:${server.port}`)}`)

    showServerBox(feature, ac, server.port, entries)

    const action = await prompt('What do you want to do?', [
        reloadOption,
        changeAcOption,
        backToFeaturesOption,
        exitOption,
    ])

    if (action === EXIT) return exitCli()

    stopActiveServer()

    if (action === RELOAD) {
        logger.step('Reloading scenario...')
        return runScenario(feature, ac)
    }

    logger.step('Server stopped')

    return action === CHANGE_AC
        ? navigateAcceptanceCriteria(feature)
        : navigate()
}

const navigateAcceptanceCriteria = async (feature: string): Promise<void> => {
    const ac = await promptAcceptanceCriteria(feature)
    if (ac === BACK_FEATURE) return navigate()

    return runScenario(feature, ac)
}

const navigate = async (): Promise<void> => {
    const feature = await promptFeature()
    if (feature === EXIT) return exitCli()

    return navigateAcceptanceCriteria(feature)
}

export const startCommand = async (): Promise<void> => {
    intro(bold('Feature Mock Server'))
    logger.info(`Mocks dir: ${dim(getMocksDir())}`)

    try {
        if (!await ensureFeatures()) return

        await navigate()
    } catch (error) {
        stopActiveServer()
        cancel((error as Error).message)
    }
}
