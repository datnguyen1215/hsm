const trim = obj => {
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) newObj[key] = value;
  });
  return newObj;
};

export default trim;
