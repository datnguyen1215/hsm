/**
 * Assign the value of a function to an object property
 * @param {object} obj - The object to assign the value to.
 * @returns {object} The object with the assigned value.
 */
const assign = obj => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'function') newObj[key] = value();
    else obj[key] = value;
    return obj;
  });
};

export default assign;
