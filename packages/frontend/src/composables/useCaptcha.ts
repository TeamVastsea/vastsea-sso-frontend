import type { AxiosInstance } from 'axios';
import { useAxios } from './axios';

export type CaptchaBehavior<T> =(fetcher: AxiosInstance, opts: T) => void;

export const geeTest:CaptchaBehavior<InitGeeTest4Opts & {onSuccess?: (resp:GetValidateRet)=>void}> = (
  fetcher: AxiosInstance,
  opts: InitGeeTest4Opts & {onSuccess?: (resp: GetValidateRet)=>void} ,
) => {
  const {onSuccess} = opts;
  if (!initGeetest4) {
    throw new Error('Only can run browser env');
  }
  initGeetest4(
    opts,
    (captchaObject) => {
      captchaObject.onReady(()=>{
        captchaObject.showCaptcha();
      })
      captchaObject.onError(()=>{})
      captchaObject.onSuccess(() => {
        const {lot_number,captcha_output,pass_token,gen_time} = captchaObject.getValidate();
        onSuccess?.({lot_number,
          captcha_output,
          pass_token,
          gen_time});
      })
    }
  );
};

export function useCaptcha<T extends CaptchaBehavior<any>,P = T extends CaptchaBehavior<infer R> ? R : unknown >(
  behavior: T,
  opts: P
) {
  const {axios} = useAxios();
  return () => behavior(axios, opts)
}
