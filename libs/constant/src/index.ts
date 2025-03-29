export const PERMISSION_KEY = Symbol('PERMISSION');
export const ID_COUNTER = {
  PERMISSION: 'PERMISSION-ID',
  ACCOUNT: 'ACCOUNT-ID',
};

export const PERMISSION_INFO_CACHE = (id: bigint) => `PERMISSION::${id}::INFO`;
export const PERMISSION_NAME_TO_ID = `PERMISSION::NAME::ID`;
export const PERMISSION_TOTAL = `PERMISSION::TOTAL`;
export const CLIENT_PERMISSION_TOTAL = (clientId: string) =>
  `PERMISSION::${clientId}::TOTAL`;
