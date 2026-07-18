import { box } from '@clack/prompts'
import type { MockEntry } from '../utils/fs'
import { blue, bold, cyan, dim, green, magenta, red, yellow } from '../utils/colors'

const METHOD_COLORS: Record<string, (text: string) => string> = {
    GET: green,
    POST: yellow,
    PUT: blue,
    PATCH: magenta,
    DELETE: red,
}

const colorMethod = (method: string): string =>
    (METHOD_COLORS[method] ?? cyan)(method.padEnd(7))

const colorStatus = (status: number): string => {
    if (status >= 500) return red(String(status))
    if (status >= 400) return yellow(String(status))
    if (status >= 300) return cyan(String(status))
    return green(String(status))
}

const formatEndpoint = (entry: MockEntry): string =>
    `${colorMethod(entry.request.method)}${entry.request.path.padEnd(30)}${dim('→')}  ${colorStatus(entry.response.status)}`

export const formatEndpoints = (entries: MockEntry[]): string =>
    entries.map(formatEndpoint).join('\n')

export const showServerBox = (feature: string, ac: string, port: number, entries: MockEntry[]): void =>
    box(
        [
            bold(cyan(`http://localhost:${port}`)),
            '',
            `${dim('Feature :')} ${feature}`,
            `${dim('Scenario:')} ${ac}`,
            '',
            dim('Endpoints:'),
            formatEndpoints(entries),
        ].join('\n'),
        '● Server running',
        { contentAlign: 'left', rounded: true }
    )
