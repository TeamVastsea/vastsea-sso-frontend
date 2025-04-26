export const FORGET_PASSWORD = (name: string, code: string, expire: string) =>
  `

尊敬的 ${name}: 

您正在执行忘记密码操作, 验证码为 <span class="code">${code}</span>. 过期时间: ${expire} 分钟

如果该操作不为您发起, 可直接忽略该邮件

` as const;

export const UPDATE_PASSWORD = (name: string, code: string, expire: string) =>
  `

尊敬的 ${name}: 

您正在执行修改密码操作, 验证码为 <span class="code">${code}</span>. 过期时间: ${expire} 分钟

如果该操作不为您发起, 可直接忽略该邮件

` as const;
