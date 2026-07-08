import type { MockServer } from './mock-server'

type Scenario = { feature: string; ac: string }

let activeScenario: Scenario | null = null
let activeServer: MockServer | null = null

export const setActiveScenario = (feature: string, ac: string): void => {
    activeScenario = { feature, ac }
}

export const getActiveScenario = (): Scenario | null => activeScenario

export const setActiveServer = (server: MockServer): void => {
    activeServer = server
}

export const stopActiveServer = (): void => {
    activeServer?.stop()
    activeServer = null
}
