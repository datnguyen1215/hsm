import hsm from '../dist/hsm';
import config from './lib/config';
import actions from './lib/actions';

const chai = import('chai');

describe('hsm', () => {
  it('create should be a function', async () => {
    const { expect } = await chai;
    expect(hsm.create).to.be.a('function');
  });

  it('assign should be a function', async () => {
    const { expect } = await chai;
    expect(hsm.assign).to.be.a('function');
  });

  const machine = hsm.create(config, { actions });
  it('create() should return an object with proper variables', async () => {
    const { expect } = await chai;
    expect(machine).to.be.an('object');
    expect(machine.dispatch).to.be.a('function');
    expect(machine.start).to.be.a('function');
    expect(machine.context).to.be.an('object');
    expect(machine.state).to.be.null;
    expect(machine.root).to.be.an('object');
    expect(machine.config).to.be.an('object');
    expect(machine.setup).to.be.an('object');
    expect(machine.setup.actions).to.be.an('object');
    expect(machine.setup.guards).to.be.an('object');
    expect(machine.states).to.be.an('object');

    Object.entries(machine.states).forEach(([key, value]) => {
      expect(value).to.be.an('object');
      expect(value.name).to.be.a('string');
      expect(value.config).to.be.a('object');

      // parent could be either an object or null
      expect(value.parent).to.satisfy(val => !val || typeof val === 'object');

      expect(value.on).to.be.an('object');
      expect(value.states).to.be.an('object');

      expect(value.always).to.be.a('function');
      expect(value.entry).to.be.a('function');
      expect(value.exit).to.be.a('function');
      expect(value.dispatch).to.be.a('function');
    });
  });

  it(`start() should transition to ${config.id}.unauthenticated state`, async () => {
    const { expect } = await chai;
    machine.start();
    expect(machine.state.name).to.equal(`${config.id}.unauthenticated`);
  });
});
