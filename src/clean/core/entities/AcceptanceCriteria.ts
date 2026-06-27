import type { MockResponse } from "./MockResponse";

export class AcceptanceCriteria {
    constructor(
        private name: string,
        private responses: Array<MockResponse>
    ) { }
}