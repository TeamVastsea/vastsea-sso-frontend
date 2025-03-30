export const PERMISSION_KEY = Symbol('PERMISSION');
export const ID_COUNTER = {
  PERMISSION: 'PERMISSION-ID',
  ACCOUNT: 'ACCOUNT-ID',
  ROLE: 'ROLE-ID',
};

export const PERMISSION_INFO_CACHE = (id: bigint) => `PERMISSION::${id}::INFO`;
export const PERMISSION_NAME_TO_ID = `PERMISSION::NAME::ID`;
export const PERMISSION_TOTAL = `PERMISSION::TOTAL`;
export const CLIENT_PERMISSION_TOTAL = (clientId: string) =>
  `PERMISSION::${clientId}::TOTAL`;

export const ROLE_TOTAL = `ROLE::TOTAL`;
export const CLIENT_ROLE_TOTAL = (clientId: string) =>
  `ROLE::${clientId}::TOTAL`;
