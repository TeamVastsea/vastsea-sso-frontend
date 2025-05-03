import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { BinaryLike, createHmac, KeyObject } from 'crypto';
import { ValidateDto } from './dto/validate.dto';
import axios from 'axios';

type ValidSuccess = {
  status: 'success';
  result: 'success';
  reason: '';
  captcha_args: {
    used_type: string;
    user_ip: string;
    lot_number: string;
    scene: string;
    referer: string;
    ip_type: number;
    user_info: string;
    client_type: string;
    ua: string;
    fail_count: number;
  };
};
type ValidFail = {
  status: 'success';
  result: 'fail';
  reason: string;
  captcha_args: Record<string, unknown>;
};
type ReqErr = {
  status: 'error'; // 请求状态
  code: string; // 错误码
  msg: string; // 错误信息
  desc: Record<string, string>;
};
type ValidPayload = ValidSuccess | ValidFail | ReqErr;
@Injectable()
export class CaptchaService {
  constructor(private config: ConfigService) {}

  valid(dto: ValidateDto) {
    const { lot_number, captcha_output, pass_token, gen_time } = dto;
    const id = this.config.get('captcha.geeTest.gtId')!;
    const key = this.config.get('captcha.geeTest.key')!;
    const url = new URL('http://gcaptcha4.geetest.com/validate');
    const sign_token = this.hmac_sha256_encode(lot_number, key);
    const params = {
      lot_number: lot_number,
      captcha_output: captcha_output,
      pass_token: pass_token,
      gen_time: gen_time,
      sign_token: sign_token,
    };
    url.searchParams.set('captcha_id', id);
    return axios<ValidPayload>({
      url: url.toString(),
      data: params,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((resp) => {
      return resp.data;
    });
  }

  hmac_sha256_encode(value: string, key: BinaryLike | KeyObject) {
    const hash = createHmac('sha256', key).update(value, 'utf8').digest('hex');
    return hash;
  }
}
