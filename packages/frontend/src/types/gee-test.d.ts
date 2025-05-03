interface InitGeeTest4Opts {
  captchaId: string;
  /**
   * @default 'float'
   */
  product?: 'float' | 'popup' | 'bind';
  /**
   * @default {width:'260px',height:'50px'}
   */
  nativeButton?: { width: string; height: string };
  /**
   * @default 1
   */
  rem?: number;
  /**
   * @default 'zho'
   */
  language?: 'zho' | 'eng' | 'zho-tw' | 'zho-hk' | 'udm' | 'jpn' | 'ind' | 'kor' | 'rus' | 'ara' | 'spa' | 'pon' | 'por' | 'fra' | 'deu';
  protocol?: 'http://' | 'https://';
  /**
   * @default 30000
   */
  timeout?: number;
  /**
   * @default []
   */
  hideBar?: ('close' | 'refresh')[];
  /**
   * @default {outside:true,bgColor:'#0000004d'}
   */
  mask?: {
    outside: boolean;
    bgColor: string;
  };
  /** @default [gcaptcha4.geetest.com] */
  apiServers?: string[];
  nextWidth?: string;
  riskType?: string;
  /** @default false */
  hideSuccess?: boolean;
  offlineCb?: (f: () => void) => void;
  onError?: (f: () => void) => void;
  userInfo?: string;
}

interface GetValidateRet {
  lot_number: string;
  captcha_output: string;
  pass_token: string;
  gen_time: string;
}

interface CaptchaObject {
  appendTo: (selector: string | Element) => void;
  getValidate: () => GetValidateRet;
  reset: () => void;
  showCaptcha: () => void;
  onReady: (f: () => void) => void;
  onSuccess: (f: () => void) => void;
  onFail: (f: () => void) => void;
  onError: (f: () => void) => void;
  onClose: (f: () => void) => void;
  destory: () => void;
}

type InitGeeTest4Handler = (
  captchaObject: CaptchaObject
) => void;

declare function initGeetest4(
  opts: InitGeeTest4Opts,
  handler: InitGeeTest4Handler
): void;
