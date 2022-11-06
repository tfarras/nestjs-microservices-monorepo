enum Roles {
  User = 'user',
  Auth = 'auth',
  Logger = 'logger',
}

enum Cmd {
  Get = 'get',
  Check = 'check',
  Log = 'log',
  Create = 'create',
}

function patternFactory(role: Roles, cmd: Cmd) {
  return {
    role,
    cmd,
  };
}

export const CREATE_USER = patternFactory(Roles.User, Cmd.Create);
export const GET_USER = patternFactory(Roles.User, Cmd.Get);
export const CHECK_AUTH = patternFactory(Roles.Auth, Cmd.Check);
export const LOG_LOGGER = patternFactory(Roles.Logger, Cmd.Log);
