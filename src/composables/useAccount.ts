import type { CommonComposablesProps } from '@/types/common-composables';
import type { Ref } from 'vue';
import SuperJSON from 'superjson';
import { reactive, ref } from 'vue';
import instance from './axios';

export interface CreateAccountMininalDto {
  email: string;
  password: string;
  profile: {
    nick: string;
    desc: string | null;
    // TODO: BACKEND UPLOAD ENDPOINT
    avatar: string | null;
  };
  role: string[];
}
export interface MininalRoleInfo {
  name: string;
  desc: string;
  id: bigint;
}

type AccountType = Omit<CreateAccountMininalDto, 'role'> & {
  role: MininalRoleInfo[];
};

export interface Account extends AccountType {
  active: boolean;
  role: MininalRoleInfo[];
}
export function useAccount(
  { fetcher }: CommonComposablesProps = { fetcher: instance },
) {
  const formData: CreateAccountMininalDto = reactive({
    email: '',
    password: '',
    profile: {
      nick: '',
      desc: '',
      avatar: '',
    },
    role: [],
  });
  const account: Ref<Account> = ref({
    email: '',
    password: '',
    profile: {
      nick: '',
      avatar: '',
      desc: '',
    },
    role: [],
    active: false,
  });
  const formRules = {
    email: [
      { required: true, message: '必填', trigger: 'change' },
      { type: 'email', trigger: 'change' },
    ],
    password: [{ required: true }],
    profile: {
      nick: [{ required: true }],
      desc: [{ required: true }],
    },
    active: [{ required: true }],
  };
  const createAccount = (valid: () => Promise<boolean>) => {
    valid()
      .then((ok) => {
        if (!ok) {
          return;
        }
        return fetcher.post('/account', formData);
      })
      .catch(() => {});
  };
  const updateAccount = (
    valid: () => Promise<boolean>,
    id: bigint,
    data: Partial<CreateAccountMininalDto>,
  ) => {
    return valid().then((ok) => {
      if (!ok) {
        return;
      }
      return fetcher.patch(
        `/account/${id}`,
        SuperJSON.serialize({
          ...data,
          id: undefined,
        }).json,
      );
    });
  };
  const fetchAccount = (id: bigint) => {
    return fetcher
      .get<unknown, Account>(`/account/${id}`)
      .then(data => (account.value = data));
  };
  const logout = () => {
    return fetcher.delete('/v2/auth/token');
  };
  return {
    formData,
    createAccount,
    updateAccount,
    fetchAccount,
    logout,
    formRules,
    account,
  };
}
