class Action {
  constructor({ machine, name }) {
    this.machine = machine;
    this.name = name;

    if (typeof name === 'function') {
      this.name = 'anonymous';
      this.func = name;
    } else this.func = machine.setup.actions[name];

    if (!this.func) throw new Error(`action not found: ${name}`);
  }

  execute(context, event) {
    return this.func(context, event);
  }
}

export default Action;
