import type { AcceptanceCriteria } from "./AcceptanceCriteria";

export class Feature {
    constructor(
        private name: string,
        private acceptanceCriterias: Array<AcceptanceCriteria>
    ) { }
}