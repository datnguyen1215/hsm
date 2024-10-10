const merge = (...objs) => {
  const isObject = obj => obj && typeof obj === 'object';

  return objs.reduce((acc, obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value) && Array.isArray(acc[key]))
        acc[key] = [...acc[key], ...value];
      else if (isObject(value) && isObject(acc[key]))
        acc[key] = merge(acc[key], value);
      else acc[key] = value;
    });

    return acc;
  }, {});
};

export default merge;
