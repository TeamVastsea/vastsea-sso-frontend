import type { CommonComposablesProps } from '@/types/common-composables';
import type { TinyForm } from '@opentiny/vue';
import type { ComponentInstance, Reactive } from 'vue';
import { type } from 'arktype';
import { reactive } from 'vue';
import instance from './axios';
import { useAccountStore, type TokenPayload } from '@/store';

export function useLogin(
  { fetcher }: CommonComposablesProps = { fetcher: instance },
) {
  const account = useAccountStore();
  const formDataSchema = type({
    email: 'string',
    password: 'string',
  });
  const formRules = {
    email: [{ required: true, message: '必填', trigger: 'change' }, { type: 'email', trigger: 'change' }],
    password: [{ required: true, message: '必填', trigger: 'change' }],
  };
  const formData: Reactive<typeof formDataSchema.infer> = reactive({
    email: '',
    password: '',
  });
  const login = (
    valid?: () => Promise<boolean>,
  ) => {
    let p = valid?.();
    p?.then((ok) => {
      if (!ok) {
        return;
      }
      fetcher.post<unknown,TokenPayload>('/auth/login', { ...formData })
        .then((resp) => {
          account.setTokenPair(resp)
          return resp;
        });
    });
  };
  return { formData, formDataSchema, formRules, login };
}
