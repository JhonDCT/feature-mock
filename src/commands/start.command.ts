import { cancel, intro, outro } from '@clack/prompts'
import { startMockServer } from '../services/mock-server'
import { setActiveScenario, setActiveServer, stopActiveServer } from '../services/state-manager'
import { showServerBox } from '../ui/components'
import {
    BACK_FEATURE,
    CHANGE_AC,
    EXIT,
    backToFeaturesOption,
    changeAcOption,
    exitOption,
    loadWithSpinner,
    prompt,
    promptAcceptanceCriteria,
    promptFeature,
} from '../ui/prompts'
import { bold, dim } from '../utils/colors'
import { getMocksDir } from '../utils/fs'
import { logger } from '../utils/logger'

const exitCli = (): void => {
    stopActiveServer()
    outro('Server stopped. See you! 👋')
}

const navigateAcceptanceCriteria = async (feature: string): Promise<void> => {
    const ac = await promptAcceptanceCriteria(feature)
    if (ac === BACK_FEATURE) return navigate()

    const entries = await loadWithSpinner(feature, ac)

    const server = startMockServer(entries)
    setActiveScenario(feature, ac)
    setActiveServer(server)
    logger.success(`Server started  →  ${bold(`http://localhost:${server.port}`)}`)

    showServerBox(feature, ac, server.port, entries)

    const action = await prompt('What do you want to do?', [
        changeAcOption,
        backToFeaturesOption,
        exitOption,
    ])

    if (action === EXIT) return exitCli()

    stopActiveServer()
    logger.step('Server stopped')

    return action === CHANGE_AC
        ? navigateAcceptanceCriteria(feature)
        : navigate()
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
        await navigate()
    } catch (error) {
        stopActiveServer()
        cancel((error as Error).message)
    }
}
