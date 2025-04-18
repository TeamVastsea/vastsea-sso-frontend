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
}
export interface MininalRoleInfo {
  name: string;
  desc: string;
  id: bigint;
}
export interface Account extends CreateAccountMininalDto {
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
    email: [{ required: true, message: '必填', trigger: 'change' }, { type: 'email', trigger: 'change' }],
    password: [{ required: true }],
    profile: {
      nick: [{ required: true }],
      desc: [{ required: true }],
    },
    active: [{ required: true }],
  };
  const createAccount = (
    valid: () => Promise<boolean>,
  ) => {
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
  ) => {
    return valid()
      .then((ok) => {
        if (!ok) {
          return;
        }
        return fetcher.patch(`/account/${id}`, SuperJSON.serialize({
          ...account.value,
          id: undefined,
        }).json);
      });
  };
  const fetchAccount = (id: bigint) => {
    return fetcher.get<unknown, Account>(`/account/${id}`)
      .then(data => account.value = data);
  };
  return { formData, createAccount, updateAccount, fetchAccount, formRules, account };
}
