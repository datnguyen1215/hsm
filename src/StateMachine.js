import StateNode from './StateNode';
import assert from './utils/assert';

class StateMachine {
  /**
   * @preserve
   * Creates a new state machine.
   * @param {hsm.StateNodeConfig} config - The configuration object for the state machine.
   * @param {hsm.Setup} setup - The setup object containing actions and guards.
   */
  constructor(config, setup) {
    this.config = config;
    this.context = config.context || {};

    this.states = {};

    /** @private */
    this.setup = setup || { actions: {}, guards: {} };
    this.setup.actions = this.setup.actions || {};
    this.setup.guards = this.setup.guards || {};

    /** @type {StateNode | null} */
    this.state = null;

    this.root = new StateNode({
      config,
      name: config.id || 'root',
      machine: this
    });

    this.states[this.root.name] = this.root;
    this.initializeStateReferences();
  }

  /**
   * Dispatches an event to the current state.
   * @param {string} eventName - The name of the event to dispatch.
   * @param {object} [data={}] - Optional data to pass with the event.
   * @returns {object} Results of the event dispatch.
   */
  dispatch(eventName, data = {}) {
    assert(eventName, 'Event name is required');

    if (!this.state) {
      console.warn(
        'State machine not started. Call start() before dispatching events.'
      );
      return {};
    }

    const result = this.state.dispatch(eventName, data);
    if (!result.target) return {};

    const exitResult = this.handleExit(result, eventName, data);
    const entryResult = this.transition(result.target, {
      type: eventName,
      data
    });

    return {
      actions: result.outputs,
      exit: exitResult,
      entry: entryResult,
      always: result.always
    };
  }

  /**
   * Transitions the state machine to a target state.
   * @param {StateNode} state - The target state.
   * @param {object} event - The event that triggered the transition.
   * @returns {object} Entry results.
   */
  transition(state, event) {
    this.state = state;
    let entryResults = this.state.entry(event);

    while (this.state.initial) {
      const next = this.state.states[this.state.initial];
      if (!next) return entryResults;
      this.state = next;
      entryResults = [...entryResults, this.state.entry(event)];
    }

    return entryResults;
  }

  /**
   * Starts the state machine, transitioning to the root state.
   */
  start() {
    this.transition(this.root, { type: 'hsm.start' });
  }

  stop() {
    // TODO: Dispose all the states/events/nodes
  }

  /**
   * Handles the exit process for a state transition.
   * @private
   * @param {object} result - The result object from dispatch.
   * @param {string} eventName - The event name.
   * @param {object} data - The event data.
   * @returns {object} Exit results.
   */
  handleExit(result, eventName, data) {
    let exitResult = {};

    if (!result.bubbles.length)
      exitResult = this.state.exit({ type: eventName, data });

    while (result.bubbles.length) {
      const bubbleState = result.bubbles.pop();
      exitResult = [
        ...exitResult,
        ...bubbleState.exit({ type: eventName, data })
      ];
    }

    return exitResult;
  }

  /**
   * Initializes state references within the state machine.
   * @private
   */
  initializeStateReferences() {
    const findTarget = (targetName, state) =>
      state.states[targetName] ||
      (state.parent && state.parent.states[targetName]) ||
      null;

    const resolveTarget = (node, state) => {
      if (!node.target) return;
      const target = this.states[node.target] || findTarget(node.target, state);
      if (!target) {
        throw new Error(`Target ${node.target} not found in ${state.name}`);
      }
      node.target = target;
    };

    const resolveEventTargets = state => {
      Object.entries(state.on).forEach(([_, { nodes }]) => {
        nodes.forEach(node => resolveTarget(node, state));
      });
    };

    const referenceTarget = state => {
      resolveEventTargets(state);
      Object.values(state.states).forEach(referenceTarget);
    };

    referenceTarget(this.root);
  }
}

export default StateMachine;
