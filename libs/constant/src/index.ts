export const PERMISSION_KEY = Symbol('PERMISSION');
export const ID_COUNTER = {
  PERMISSION: 'PERMISSION-ID',
  ACCOUNT: 'ACCOUNT-ID',
  ROLE: 'ROLE-ID',
  PROFILE: 'PROFILE-ID',
  CLIENT: 'CLIENT-ID',
};

export const PERMISSION_INFO_CACHE = (id: bigint) => `PERMISSION::${id}::INFO`;
export const PERMISSION_NAME_TO_ID = `PERMISSION::NAME::ID`;
export const PERMISSION_TOTAL = `PERMISSION::TOTAL`;
export const CLIENT_PERMISSION_TOTAL = (clientId: string) =>
  `PERMISSION::${clientId}::TOTAL`;

export const ROLE_TOTAL = `ROLE::TOTAL`;
export const ROLE_INFO = (roleId: bigint) => `ROLE::${roleId}::INFO`;
export const ACCOUNT_ROLE = (accountId: string | bigint, clientId: string) =>
  `ACCOUNT::${accountId}::${clientId}::ROLE`;
export const CLIENT_ROLE_TOTAL = (clientId: string) =>
  `ROLE::${clientId}::TOTAL`;
export const CLIENT_DEFAULT_ROLE = (cilentId: string) =>
  `CLIENT::${cilentId}::DEFAULT::ROLE`;

export const OAUTH_CODE_ID_PAIR = (code: string) => `OAUTH::${code}`;

export const TOKEN_PAIR = (id: string, type: 'access' | 'refresh') =>
  `TOKEN::${id}::${type}`;
export const TOKEN_PAIR_META = (id: string) => `TOKEN::${id}::meta`;

export const CLIENT_SECRET = (clientId: string) =>
  `CLIENT::${clientId}::SECRET`;

export const CLIENT_NAME__ID = (clientName: string) =>
  `CLIENT::${clientName}::CLIENT_ID`;

export const CLIENT_INFO = (clientId: string) => `CLIENT::${clientId}::INFO`;
export const CLIENT_PK__ID = (pk: bigint) => `CLIENT::${pk}::ID`;
export const CLIENT_TOTAL = () => `CLIENT::TOTAL`;
export const AUTH_EMAIL_CODE = (email: string) => `AUTH::${email}::CODE`;

export const ACCOUNT_TOTAL = `ACCOUNT_TOTAL`;
export const ACCOUNT_ASSIGN_CLIENT_TOTAL = (managerId: bigint) =>
  `ACCOUNT::${managerId}::CLIENT::TOTAL`;
