export type MockRequest = { method: string; path: string }
export type MockResponse = { status: number; body: unknown }
export type MockEntry = { request: MockRequest; response: MockResponse }
export type ResponsesSchema = { responses: MockEntry[] }
