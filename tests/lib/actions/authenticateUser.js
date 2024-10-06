const authenticateUser = (context, event) => {
  console.log('Authenticating user...');
  if (
    event.data.username === 'validUser' &&
    event.data.password === 'validPass'
  ) {
    return { success: true, user: { username: event.data.username, id: 1 } };
  }
  return { success: false, error: 'Invalid credentials' };
};

export default authenticateUser;
