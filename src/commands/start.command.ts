import { intro } from '@clack/prompts'
import { startMockServer } from '../services/mock-server'
import { setActiveScenario, setActiveServer, stopActiveServer } from '../services/state-manager'
import { logger } from '../utils/logger'
import { showServerBox } from '../ui/components'
import {
    BACK_FEATURE,
    CHANGE_AC,
    backToFeaturesOption,
    changeAcOption,
    prompt,
    promptFeature,
    promptAcceptanceCriteria,
    loadWithSpinner,
} from '../ui/prompts'

const navigateAcceptanceCriteria = async (feature: string): Promise<void> => {
    const ac = await promptAcceptanceCriteria(feature)
    if (ac === BACK_FEATURE) return navigate()

    const entries = await loadWithSpinner(feature, ac)

    const server = startMockServer(entries)
    setActiveScenario(feature, ac)
    setActiveServer(server)
    logger.success(`Server started  →  http://localhost:${server.port}`)

    showServerBox(feature, ac, server.port, entries)

    const action = await prompt('What do you want to do?', [changeAcOption, backToFeaturesOption])

    stopActiveServer()
    logger.step('Server stopped')

    return action === CHANGE_AC
        ? navigateAcceptanceCriteria(feature)
        : navigate()
}

const navigate = async (): Promise<void> => {
    const feature = await promptFeature()

    return navigateAcceptanceCriteria(feature)
}

export const startCommand = async (): Promise<void> => {
    intro('Feature Mock Server')

    await navigate()
}
