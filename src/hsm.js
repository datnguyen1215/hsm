import StateMachine from './StateMachine';
import actions from './actions';

const { assign } = actions;

/**
 * Creates a new state machine.
 * @param {StateNodeConfig} config - The configuration for the state machine.
 * @param {Setup} setup - The setup for the state machine.
 * @returns {StateMachine} The new state machine.
 */
const create = (config, setup) => new StateMachine(config, setup);

export { actions, assign, create };
export default { create, actions, assign };
