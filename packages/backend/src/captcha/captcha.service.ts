import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';

type InitCaptchaPayload = {
  challenge: string;
};
type VerifyParam = {
  geetest_challenge: string;
  geetest_validate: string;
  geetest_seccode: string;
};
type RemoteVerifyResp =
  | {
      seccode: string;
    }
  | {
      seccode: 'false';
    };
type VerifyResp = {
  result: 'success' | 'fail';
  version?: string;
  msg?: string;
};
@Injectable()
export class CaptchaService {
  private BYPASS_URL =
    'http://bypass.geetest.com/v1/bypass_status.php' as const;
  private INIT_CAPTCHA = 'http://api.geetest.com/register.php	';
  private VALIDATE = 'http://api.geetest.com/validate.php';
  constructor(private config: ConfigService) {}

  active() {
    const url = new URL(this.BYPASS_URL);
    return fetch(url)
      .then((resp) => resp.json())
      .then((resp) => resp.status === 'success');
  }

  initCaptcha() {
    const url = new URL(this.INIT_CAPTCHA);
    url.searchParams.set('digestmod', 'md5');
    url.searchParams.set('gt', this.config.get('captcha.geeTest.gtId')!);
    url.searchParams.set('json_format', '1');
    url.searchParams.set('sdk', 'node-express:3.1.1');

    return fetch(url)
      .then((resp) => resp.json())
      .then((resp: InitCaptchaPayload) => resp)
      .then((resp) => ({
        ok: resp.challenge !== '0',
        message: resp.challenge === '0' ? '账号id有误' : '',
        challenge: resp.challenge,
        gt: this.config.get('captcha.geeTest.gtId')!,
      }));
  }

  verify({ geetest_challenge, geetest_seccode }: VerifyParam) {
    const url = new URL(this.VALIDATE);
    url.searchParams.set('sdk', 'node-express:3.1.1');
    url.searchParams.set('json_format', '1');
    url.searchParams.set('captchaid', this.config.get('captcha.geeTest.gtId')!);
    url.searchParams.set('seccode', geetest_seccode);
    url.searchParams.set('challenge', geetest_challenge);
    return fetch(url)
      .then((resp) => resp.json())
      .then((resp: RemoteVerifyResp) => {
        return resp.seccode !== 'false';
      })
      .then((success) => {
        return {
          success,
        };
      });
  }
}
