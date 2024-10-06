/**
 * Assign the value of a function to an object property
 * @param {object} obj - The object to assign the value to.
 * @returns {object} The object with the assigned value.
 */
const assign = obj => context => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'function') context[key] = value();
    else context[key] = value;
  });
};

export default assign;
