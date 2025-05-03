import type { TokenPayload } from '@/store';
import type { CommonComposablesProps } from '@/types/common-composables';
import type { Reactive } from 'vue';
import { useAccountStore } from '@/store';
import { type } from 'arktype';
import { reactive } from 'vue';
import instance from './axios';

export function useLogin(
  { fetcher }: CommonComposablesProps = { fetcher: instance },
) {
  const account = useAccountStore();
  const formDataSchema = type({
    email: 'string',
    password: 'string',
  });
  const formRules = {
    email: [
      { required: true, message: '必填', trigger: 'change' },
      { type: 'email', trigger: 'change' },
    ],
    password: [{ required: true, message: '必填', trigger: 'change' }],
  };
  const formData: Reactive<typeof formDataSchema.infer> = reactive({
    email: '',
    password: '',
  });
  const login = (valid?: () => Promise<boolean>) => {
    const p = valid?.();
    p?.then((ok) => {
      if (!ok) {
        return;
      }
      fetcher
        .post<unknown, TokenPayload>('/auth/login', { ...formData })
        .then((resp) => {
          account.setTokenPair(resp);
          return resp;
        });
    });
  };
  return { formData, formDataSchema, formRules, login };
}
