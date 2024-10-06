/** @namespace hsm */

/**
 * @typedef {object} hsm.EventConfig
 * @property {string} [target]
 * @property {string} [actions]
 * @property {string} [guard]
 */

/**
 * @typedef {Object} hsm.StateNodeConfig
 * @property {string} [id]
 * @property {string} [initial]
 * @property {string[]} [entry]
 * @property {string[]} exit
 * @property {Object.<string, hsm.EventConfig | hsm.EventConfig[]>} [on]
 * @property {hsm.EventConfig | hsm.EventConfig[]} [always]
 * @property {Object.<string, hsm.StateConfig>} [states]
 */

/**
 * @callback hsm.ActionFunction
 * @param {object} context
 * @param {object} data
 * @returns {object}
 */

/**
 * @callback hsm.GuardFunction
 * @param {object} context
 * @param {object} data
 * @returns {boolean}
 */

/**
 * @typedef {object} hsm.Setup
 * @property {object.<string, hsm.ActionFunction>} [actions]
 * @property {object.<string, hsm.GuardFunction>} [guards]
 */
