import { select, isCancel, cancel, spinner } from '@clack/prompts'
import { listsFeatures, listsAcceptanceCriteria, loadResponses } from '../utils/fs'
import type { MockEntry } from '../utils/fs'

export const BACK_FEATURE = '__back_feature__'
export const CHANGE_AC = '__change_ac__'

const toSelectOption = (value: string) => ({ value, label: value })

export const backToFeaturesOption = { value: BACK_FEATURE, label: '← Back to features' }
export const changeAcOption = {
    value: CHANGE_AC,
    label: '← Change acceptance criteria',
    hint: 'Restart server with a different scenario',
}

const handleCancel = (): never => {
    cancel('Operation cancelled. Server stopped.')
    process.exit(0)
}

export const prompt = async (
    message: string,
    options: { value: string; label: string; hint?: string }[]
): Promise<string> => {
    const selected = await select({ message, options })

    if (isCancel(selected)) handleCancel()

    return selected as string
}

const pluralize = (n: number, word: string): string => `${n} ${word}${n !== 1 ? 's' : ''}`

export const promptFeature = async (): Promise<string> => {
    const features = await listsFeatures()

    return prompt('Select a feature:', features.map(toSelectOption))
}

export const promptAcceptanceCriteria = async (feature: string): Promise<string> => {
    const acs = await listsAcceptanceCriteria(feature)

    return prompt(
        `Select a scenario  [${feature}]:`,
        [...acs.map(toSelectOption), backToFeaturesOption],
    )
}

export const loadWithSpinner = async (feature: string, ac: string): Promise<MockEntry[]> => {
    const spin = spinner()
    spin.start('Loading responses...')

    const entries = await loadResponses(feature, ac)
    spin.stop(`Loaded ${pluralize(entries.length, 'endpoint')}`)

    return entries
}
