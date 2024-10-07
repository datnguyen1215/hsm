import EventNode from './EventNode';

class StateEvent {
  constructor({ machine, config, state, name }) {
    this.machine = machine;
    this.config = config;
    this.state = state;
    this.name = name;

    this.nodes = (
      Array.isArray(config)
        ? config
        : [typeof config === 'string' ? { target: config } : config]
    ).map(x => new EventNode({ machine, event: this, config: x }));
  }

  execute(context, event) {
    const node = this.nodes.find(x => !x.guard || x.guard(context, event));

    if (!node) return {};

    return { target: node.target, outputs: node.execute(context, event) };
  }
}

export default StateEvent;
