import Action from './Action';
import StateEvent from './StateEvent';
import merge from './utils/merge';

class StateNode {
  /**
   * Represents a state node within a state machine.
   * @param {object} options - Options for initializing the state node.
   * @param {StateMachine} options.machine - The state machine this node belongs to.
   * @param {string} options.name - The name of this state node.
   * @param {hsm.StateNodeConfig} options.config - Configuration object for this state node.
   * @param {StateNode} [options.parent] - The parent state node.
   */
  constructor({ machine, name, config, parent }) {
    this.config = config;
    this.parent = parent;
    this.machine = machine;
    this.id = config.id;
    this.initial = config.initial;
    this.name = name;

    this.states = Object.keys(config.states || {}).reduce((acc, x) => {
      acc[x] = new StateNode({
        machine,
        name: `${name}.${x}`,
        config: config.states[x],
        parent: this
      });
      return acc;
    }, {});

    this.entryActions = (config.entry || []).map(
      x => new Action({ machine, name: x })
    );

    this.exitActions = (config.exit || []).map(
      x => new Action({ machine, name: x })
    );

    this.alwaysEvent = !config.always
      ? null
      : new StateEvent({
          machine,
          state: this,
          config: config.always,
          name: `${name}.always`
        });

    /**
     * @type {object.<string, StateEvent>}
     */
    this.on = Object.keys(config.on || {}).reduce((acc, x) => {
      acc[x] = new StateEvent({
        machine,
        state: this,
        config: config.on[x],
        name: `${name}.${x}`
      });
      return acc;
    }, {});
  }

  /**
   * Dispatches an event to the state node.
   * @param {object} event - The event to dispatch.
   * @param {Array} [bubbles=[]] - Tracks the event bubbling history.
   * @returns {object} Results of the dispatched event.
   */
  dispatch(event, bubbles = []) {
    switch (event.type) {
      case 'hsm.predefined.entry':
        return { outputs: this.entry(this.machine.context, event) };

      case 'hsm.predefined.exit':
        return { outputs: this.exit(this.machine.context, event) };

      case 'hsm.predefined.always':
        return this.always(this.machine.context, event);

      default:
        break;
    }

    const ev = this.on[event.type];

    if (!ev) return this.bubble(event, bubbles);

    const { outputs, ...alwaysResults } = this.dispatch(
      'hsm.predefined.always',
      event
    );

    const results = {
      bubbles,
      ...ev.execute(this.machine.context, event)
    };

    return { ...results, ...alwaysResults, always: outputs };
  }

  /**
   * Bubbles an event up through the state hierarchy if not handled by the current state.
   * Executes 'always' actions for each state during the bubbling process.
   * @param {object} event - The event to bubble.
   * @param {Array} [bubbles=[]] - Tracks the event bubbling history.
   * @returns {object} Results of the event after bubbling and executing 'always' actions.
   */
  bubble(event, bubbles = []) {
    const { outputs, ...alwaysResults } = this.always(
      this.machine.context,
      event
    );

    if (!this.parent) return { ...alwaysResults, always: outputs };

    const results = this.parent.dispatch(event, [this, ...bubbles]);
    return { ...results, ...alwaysResults, always: outputs };
  }

  /**
   * Executes entry actions for the state node.
   * @param {object} event - The event triggering entry actions.
   * @returns {object} Results of the entry actions.
   */
  entry(event) {
    return this.entryActions.map(x => ({
      state: this.name,
      action: x.name,
      output: x.execute(this.machine.context, event)
    }));
  }

  /**
   * Executes exit actions for the state node.
   * @param {object} event - The event triggering exit actions.
   * @returns {object} Results of the exit actions.
   */
  exit(event) {
    return this.exitActions.map(x => ({
      state: this.name,
      action: x.name,
      output: x.execute(this.machine.context, event)
    }));
  }

  /**
   * Executes the 'always' event for the state node if configured.
   * @param {object} event - The event triggering the 'always' execution.
   * @returns {object} Result of the 'always' event execution.
   */
  always(event) {
    let result = { outputs: [] };

    let state = this;

    if (state.alwaysEvent)
      result = merge(
        {},
        result,
        state.alwaysEvent.execute(this.machine.context, event)
      );

    // bubble all the way to root.
    while (state.parent) {
      state = state.parent;
      result = merge({}, result, state.dispatch(event));
    }

    return result;
  }
}

export default StateNode;
