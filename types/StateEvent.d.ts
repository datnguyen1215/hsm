export default StateEvent;
declare class StateEvent {
    constructor({ state, config, name }: {
        state: StateNode;
        config: string | import("./types").EventNode | import("./types").EventNode[];
        name: string;
    });
    name: string;
    state: StateNode;
    config: import("./types").EventNode[];
    get context(): object;
    get machine(): import("./StateMachine").default;
    normalizeConfig(config: string | import("./types").EventNode | import("./types").EventNode[]): import("./types").EventNode[];
    execute(data: object): import("./types").ExecuteResult;
}
import StateNode from './StateNode';
