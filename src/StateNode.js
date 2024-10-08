import Action from './Action';
import StateEvent from './StateEvent';

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
   * @param {string} eventName - The event name to dispatch.
   * @param {object} [data={}] - Optional data to pass with the event.
   * @param {Array} [bubbles=[]] - Tracks the event bubbling history.
   * @returns {object} Results of the dispatched event.
   */
  dispatch(eventName, data = {}, bubbles = []) {
    const ev = this.on[eventName];

    if (!ev) {
      if (!this.parent) return {};

      const results = this.parent.dispatch(eventName, data, [this, ...bubbles]);

      const alwaysResults = this.always(this.machine.context, {
        type: eventName,
        data
      });

      return { ...results, always: alwaysResults };
    }

    const results = {
      bubbles,
      ...ev.execute(this.machine.context, { type: eventName, data })
    };

    const alwaysResults = this.always(this.machine.context, {
      type: eventName,
      data
    });

    return { ...results, always: alwaysResults };
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
    if (!this.alwaysEvent) return [];

    return this.alwaysEvent.execute(this.machine.context, event);
  }
}

export default StateNode;
