class Action {
  constructor({ machine, name }) {
    this.machine = machine;
    this.name = name.toString();

    if (typeof name === 'function') this.func = name;
    else this.func = machine.setup.actions[name];

    if (!this.func) throw new Error(`action not found: ${name}`);
  }

  execute(context, event) {
    return this.func(context, event);
  }
}

export default Action;
