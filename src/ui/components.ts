import { box } from '@clack/prompts'
import type { MockEntry } from '../utils/fs'

const formatEndpoint = (entry: MockEntry): string =>
    `${entry.request.method.padEnd(7)}${entry.request.path.padEnd(30)}→  ${entry.response.status}`

export const formatEndpoints = (entries: MockEntry[]): string =>
    entries.map(formatEndpoint).join('\n')

export const showServerBox = (feature: string, ac: string, port: number, entries: MockEntry[]): void =>
    box(
        `http://localhost:${port}\n\nFeature : ${feature}\nScenario: ${ac}\n\nEndpoints:\n${formatEndpoints(entries)}`,
        'Server running',
        { contentAlign: 'left' }
    )
