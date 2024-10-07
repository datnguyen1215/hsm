import Action from './Action';
import StateEvent from './StateEvent';
import StateMachine from './StateMachine';

class EventNode {
  /**
   * Creates an instance of EventNode.
   * @param {object} options - Options for initializing the EventNode.
   * @param {StateMachine} options.machine - The state machine the event is part of.
   * @param {StateEvent} options.event - The event associated with the node.
   * @param {hsm.EventConfig} options.config - Configuration for the event node.
   */
  constructor({ machine, event, config }) {
    if (typeof config === 'string') config = { target: config };

    /** @type {StateMachine} */
    this.machine = machine;
    /** @type {StateEvent} */
    this.event = event;
    /** @type {string|undefined} */
    this.target = config.target;
    /** @type {Action[]} */
    this.actions = (config.actions || []).map(
      x => new Action({ machine, name: x })
    );
    /** @type {Function|null} */
    this.guard = config.guard ? this.machine.guards[config.guard] : null;
  }

  /**
   * Executes the actions of the event node.
   * @param {object} context - The context in which to execute the actions.
   * @param {StateEvent} event - The event triggering the execution.
   * @returns {object} The results of the actions.
   */
  execute(context, event) {
    return this.actions.map(x => ({
      state: this.event.state.name,
      action: x.name,
      output: x.execute(context, event)
    }));
  }
}

export default EventNode;
