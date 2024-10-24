const assert = (predicate, message) => {
  if (predicate) return;

  message = message || `Assertion failed: ${predicate.toString()}`;

  // @ts-ignore
  throw new Error(message, {
    cause: { code: 'ASSERTION_FAILED' },
    message
  });
};
export default assert;
