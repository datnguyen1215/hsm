import hsm, { assign } from '../dist/hsm';
import config from './lib/config';
const chai = import('chai');

const states = {
  actions: {
    authenticateUser: {
      executed: false
    },
    logoutUser: {
      executed: false
    },
    saveProfileData: {
      executed: false
    }
  }
};

const actions = {
  authenticateUser: async (_, event) => {
    states.actions.authenticateUser.executed = true;
    const { data } = event;
    if (data.username === 'admin' && data.password === 'password')
      return { type: 'AUTH_SUCCESS', data: { user: { username } } };

    return { type: 'AUTH_FAILURE' };
  },
  saveProfileData: async (_, event) => {
    states.actions.saveProfile.executed = true;
    return { type: 'SAVE_PROFILE', data: event.data };
  },
  fetchUserData: async () => {
    return { type: 'FETCH_USER_DATA' };
  },
  logoutUser: assign({ user: null }),
  logState: async (_, event) => {
    console.log(event);
  }
};

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

    Object.entries(machine.states).forEach(([_, value]) => {
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

  it('dispatch() should throw if no eventName provided.', async () => {
    const { expect } = await chai;
    expect(() => machine.dispatch()).to.throw('Event name is required');
  });

  it(`dispatch('LOGOUT') shouldn't change state nor execute any functions`, async () => {
    const { expect } = await chai;
    const oldMachineState = machine.state;
    const results = machine.dispatch('LOGOUT');
    expect(results).to.be.an('object');
    expect(results.entry).to.be.undefined;
    expect(results.exit).to.be.undefined;
    expect(results.always).to.be.undefined;
    expect(states.actions.logoutUser.executed).to.be.false;
    expect(machine.state).to.equal(oldMachineState);
  });

  it('dispatch() should return an object with actions, exit, and entry keys', async () => {
    const { expect } = await chai;
    const result = machine.dispatch('LOGIN', {
      username: 'admin',
      password: 'password'
    });
    expect(result).to.be.an('object');
    console.log(result);
  });
});
