import { autocomplete, cancel, isCancel, select, spinner } from '@clack/prompts'
import { stopActiveServer } from '../services/state-manager'
import type { MockEntry } from '../utils/fs'
import { getMocksDir, listsAcceptanceCriteria, listsFeatures, loadResponses } from '../utils/fs'

export const BACK_FEATURE = '__back_feature__'
export const CHANGE_AC = '__change_ac__'
export const RELOAD = '__reload__'
export const EXIT = '__exit__'

const AUTOCOMPLETE_THRESHOLD = 7

type SelectOption = { value: string; label: string; hint?: string }

export const backToFeaturesOption = { value: BACK_FEATURE, label: '← Back to features' }
export const changeAcOption = {
    value: CHANGE_AC,
    label: '← Change acceptance criteria',
    hint: 'Restart server with a different scenario',
}
export const reloadOption = {
    value: RELOAD,
    label: '↻ Reload scenario',
    hint: 'Re-read responses.json and restart the server',
}
export const exitOption = { value: EXIT, label: '✖ Exit', hint: 'Stop server and quit' }

const handleCancel = (): never => {
    stopActiveServer()
    cancel('Operation cancelled. Server stopped.')
    process.exit(0)
}

export const prompt = async (message: string, options: SelectOption[]): Promise<string> => {
    const selected = options.length >= AUTOCOMPLETE_THRESHOLD
        ? await autocomplete({ message, options, placeholder: 'Type to filter...' })
        : await select({ message, options })

    if (isCancel(selected)) handleCancel()

    return selected as string
}

const pluralize = (n: number, word: string): string => `${n} ${word}${n !== 1 ? 's' : ''}`

const withCounts = <T>(
    items: string[],
    count: (item: string) => Promise<T[]>,
    word: string,
): Promise<SelectOption[]> =>
    Promise.all(items.map(async item => ({
        value: item,
        label: item,
        hint: await count(item)
            .then(found => pluralize(found.length, word))
            .catch(() => undefined),
    })))

export const promptFeature = async (): Promise<string> => {
    const features = await listsFeatures()
    if (!features.length) throw new Error(`No "*-feature" folders found in ${getMocksDir()}`)

    const options = await withCounts(features, listsAcceptanceCriteria, 'scenario')

    return prompt('Select a feature:', [...options, exitOption])
}

export const promptAcceptanceCriteria = async (feature: string): Promise<string> => {
    const acs = await listsAcceptanceCriteria(feature)
    if (!acs.length) throw new Error(`No scenario folders found in ${getMocksDir()}/${feature}`)

    const options = await withCounts(acs, ac => loadResponses(feature, ac), 'endpoint')

    return prompt(
        `Select a scenario  [${feature}]:`,
        [...options, backToFeaturesOption],
    )
}

export const loadWithSpinner = async (feature: string, ac: string): Promise<MockEntry[]> => {
    const spin = spinner()
    spin.start('Loading responses...')

    try {
        const entries = await loadResponses(feature, ac)
        if (!entries.length) throw new Error('Not found mock entries')

        spin.stop(`Loaded ${pluralize(entries.length, 'endpoint')}`)

        return entries
    } catch (error) {
        spin.error('Failed to load responses')
        throw error
    }
}
