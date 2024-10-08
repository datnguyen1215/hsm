import { assign } from '@dist/hsm';

const config = {
  id: '#authenticationHsm',
  initial: 'unauthenticated',
  context: { user: null },
  on: {
    LOGOUT: {
      target: 'unauthenticated',
      actions: ['logoutUser']
    }
  },
  always: {
    actions: ['logState']
  },
  states: {
    unauthenticated: {
      id: '#unauthenticated',
      on: {
        LOGIN: 'authenticating',
        // shouldn't do anything
        LOGOUT: {}
      }
    },
    authenticating: {
      entry: ['authenticateUser'],
      always: {
        actions: ['logState']
      },
      on: {
        AUTH_SUCCESS: {
          target: 'authenticated',
          actions: [assign({ user: (context, event) => event.data.user })]
        },
        AUTH_FAILURE: {
          target: 'authFailed'
        },
        // prevent logging out while authenticating. We don't want things
        // to go wrong.
        LOGOUT: {}
      }
    },
    authenticated: {
      initial: 'idle',
      entry: ['fetchUserData'],
      states: {
        idle: {
          on: {
            VIEW_PROFILE: 'viewingProfile'
          }
        },
        viewingProfile: {
          on: {
            EDIT_PROFILE: {
              target: 'editingProfile'
            },
            CANCEL: 'idle'
          }
        },
        editingProfile: {
          on: {
            SAVE_PROFILE: {
              target: 'idle',
              actions: ['saveProfileData']
            },
            CANCEL: 'viewingProfile'
          }
        }
      }
    },
    authFailed: {
      on: {
        RETRY: 'authenticating'
      }
    }
  }
};

export default config;
