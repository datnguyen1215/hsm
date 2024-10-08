import StateNode from './StateNode';

class StateMachine {
  /**
   * @param {StateNodeConfig} config
   * @param {Setup} setup
   */
  constructor(config, setup) {
    this.config = config;
    this.context = config.context || {};
    this.states = {};
    this.setup = setup || { actions: {}, guards: {} };
    this.setup.actions = this.setup.actions || {};
    this.setup.guards = this.setup.guards || {};

    this.state = null;

    this.root = new StateNode({
      config,
      name: config.id || 'root',
      machine: this
    });

    this.states[this.root.name] = this.root;

    const findTarget = (targetName, state) => {
      if (state.states[targetName]) return state.states[targetName];
      if (state.parent && state.parent.states[targetName])
        return state.parent.states[targetName];
      return null;
    };

    const resolveTarget = (node, state) => {
      if (!node.target) return;

      const target = this.states[node.target] || findTarget(node.target, state);

      if (!target) {
        throw new Error(`Target ${node.target} not found in ${state.name}`);
      }

      console.log(`Assigning target ${node.target} to ${target.name}`);
      node.target = target;
    };

    const resolveEventTargets = state => {
      Object.entries(state.on).forEach(([event, { nodes }]) => {
        console.log(`Checking event: ${event}`);
        nodes.forEach(node => resolveTarget(node, state));
      });
    };

    const referenceTarget = state => {
      resolveEventTargets(state);
      Object.values(state.states).forEach(referenceTarget);
    };

    referenceTarget(this.root);
  }

  dispatch(eventName, data = {}) {
    const result = this.state.dispatch(eventName, data);
    let exitResult = {};

    if (!result.target) return {};

    if (!result.bubbles.length)
      exitResult = {
        [this.state.name]: this.state.exit({ type: eventName, data })
      };

    while (result.bubbles.length) {
      const bubbleState = result.bubbles.pop();
      // TODO: Save results to handle actions results.
      exitResult = {
        ...exitResult,
        [this.state.name]: bubbleState.exit({ type: eventName, data })
      };
    }

    const entryResult = this.transition(result.target, {
      type: eventName,
      data
    });

    return { actions: result.actions, exit: exitResult, entry: entryResult };
  }

  transition(state, event) {
    this.state = state;
    let entryResults = { [state.name]: this.state.entry(event) };

    while (this.state.initial) {
      const next = this.state.states[this.state.initial];

      if (!next) return;

      this.state = next;
      entryResults = {
        ...entryResults,
        [this.state.name]: this.state.entry(event)
      };
    }

    return entryResults;
  }

  start() {
    this.transition(this.root, { type: 'hsm.start' });
  }

  stop() {
    // TODO: Dispose all the states/events/nodes
  }
}

export default StateMachine;
