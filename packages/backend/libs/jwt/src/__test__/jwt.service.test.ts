import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../jwt.service';
import * as jose from '@gaonengwww/jose';
import { MODULE_OPTIONS_TOKEN } from '../jwt.options';

describe('JwtService', () => {
  let service: JwtService;
  const mockOptions = {
    pubKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4w8cFTDvGLhczeVbetbL
DdulJsSxco5qNIK1rircP8Tn7mqKaWClU6jOQ7POcu8z1XQiFMgciL1P3/JdnHYg
EGViuw+NDGxuLb1XNdVu89ON4pR0FUdDqeQrlYy91K0tSu9GlHxV4GY1Ngs2CkJk
gooLLTfAnE40YeTILj6YX4b4QJBRKz488+oVHlMX7xCnHDG+I4cIAE/vc2f7siWp
R5D5W6soACtJB8odXJG4BLY+XBvdMm+M25W8pwiodKHkh0obBIvc/RiPpF2T6nXd
7Hw3F3loi8ZbixJ8ILIWo3zHVeVXch99ITbccTVMswP+Pa6DLs51pzFC5dzxC1/Q
3QIDAQAB
-----END PUBLIC KEY-----`,
    priKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDjDxwVMO8YuFzN
5Vt61ssN26UmxLFyjmo0grWuKtw/xOfuaoppYKVTqM5Ds85y7zPVdCIUyByIvU/f
8l2cdiAQZWK7D40MbG4tvVc11W7z043ilHQVR0Op5CuVjL3UrS1K70aUfFXgZjU2
CzYKQmSCigstN8CcTjRh5MguPphfhvhAkFErPjzz6hUeUxfvEKccMb4jhwgAT+9z
Z/uyJalHkPlbqygAK0kHyh1ckbgEtj5cG90yb4zblbynCKh0oeSHShsEi9z9GI+k
XZPqdd3sfDcXeWiLxluLEnwgshajfMdV5VdyH30hNtxxNUyzA/49roMuznWnMULl
3PELX9DdAgMBAAECggEBAI+Lhd1/yih+pW0liufl0wk3yvjvcJ9TmaEI4YLyZbuK
6HW5tTdZeiuhlIUIr4PJ5aMUgFdTC3cG9/BEcRnxM+QptHk+I5WvFxijkvbdr/9F
x3VvFNQ+8W/+Z+9rwrcppHCzRJOq5z+uXgWEoO1re89rJhW4IXSvnD4nPMa/m+UH
ZeyF8Ci01xv7ILNqc9mn64iUWxZxBBbjcHwVVZ1pEnirBAfoUE2vhKHmoO563Hcl
klDKpxkYATMkCsMWy9mtxZgT0GJWdpUKrOvKCrbdK3xtmasmSHLOYI4pZI7STSOo
+227D8Xl/6Wf50z+f4H0H0Hr/pOZkXn8MCXYTc+lhaECgYEA+kamaz855kfR7K0D
ugHESoKSYDcoluXtJxwa5rRIdQhF3Z52iqo0+APiop9tiIacGo6LAafyInVZcdGp
KihP99J/Ahlnad3saU+3Nk1WtY9M99+56wXDMg30kBFx8VAt+4QExTP8pF9VrtsW
ssrForszseueGBABs/81sYzG/TsCgYEA6ECGnOvvxtMhbAXg2Fc0TnW8m2W+niJ+
0EC5kjs3HmNkooSIDUIw7TTenSkGQw37PKCNsdkW+09RHY+Eq+tggtbw6KLug/S0
OC88yqbPj2qfdze/kSP/x6/3/gBhCr6VVsbQbEY1ALlhXr1IMZs1Zy/12Lqcot65
2ex7ughjaMcCgYByaanajWTiqSKGl/GELxqVFWvlIFIl6aaoomiJ3xDgr4+A6Ng4
O+dLGjuZLFjeeOsUGOXjM+u1ZQAm0DoNU7B7EneNdh+YfiN9YTvYTzK8fW4qQtSz
ZEb/svGCivcT4hujR48Gt+VfH1YEQZP22EvRQNM5GwWC6o5cwubA7CJr0QKBgDZi
NaM1FBZoheD3l2jRMqxUoW956aK5zRwSq+F0ADobaAsuIXWJVE+XG7GNU6wL8BKI
PeWxQdJjBkl3u8dN/HFmx06SKGu5tyGY3hFN8jhQ7TpLUY448cHekKFnkVGkwu9o
6pEP94VN42D9zZPgFictcdHoEJmKsdY3q9kp8a0tAoGAUxB2IrNhnJbul2LA+rVy
f4xYlKxxaKjx6BKSVQI4LBTxwd9G6Y9uIaGQ6t1yNJRsjwpuIq0dwTliRiGkX4va
k8TDCb3u3RF1q5VRzuV4wn8dRbIyhc45OCmmhBqSgxqzRWKkrkZu14h4St949Il9
JE/OCzfLg67wiYB2hbRHgGc=
-----END PRIVATE KEY-----`,
    keyPairType: 'RS256',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: mockOptions,
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should sign jwt', () => {
    const mockDecoded = {
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    };
    expect(
      service.sign(mockDecoded, 'access', 10000, { issuer: '123' }),
    ).resolves.toBeDefined();
  });
  const delay = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, time);
    });
  };
  describe('Verify', () => {
    it('Sucess', async () => {
      const token = await service.sign({ name: 'zhangsan' }, 'access', 10000, {
        issuer: '123',
      });
      expect((await service.verify(token)).payload.name).toBe('zhangsan');
    });
    it('Fail because expired', async () => {
      const token = await service.sign({ name: 'zhangsan' }, 'access', 1000, {
        issuer: '123',
      });
      await delay(1000);
      expect(service.verify(token)).rejects.toThrow(jose.errors.JWTExpired);
    });
    it('Fail, Invalid Token', () => {
      const token = 'fake-token';
      expect(service.verify(token)).rejects.toThrow(jose.errors.JWSInvalid);
    });
  });
  it('Decode', async () => {
    const mockDecoded = {
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    };
    expect(
      service.decode(
        await service.sign(mockDecoded, 'access', 10000, { issuer: 'issuer' }),
      ),
    ).resolves.toBeDefined();
  });
});
