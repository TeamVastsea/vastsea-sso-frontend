import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../jwt.service';
import * as jose from '@gaonengwww/jose';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sign token', ()=>{
    const token = service.sign({foo: 'bar'}, 'secret', 'access', '1s' ,'HS256', 'vastsea')
    expect(token).resolves.toBeDefined();
  })
  describe('verify token', ()=>{
    it('JWSInvalid', ()=>{
      expect(service.verify('fail', 'secret', 'hs256')).rejects.toThrow()
      expect(service.verify('fail', 'secret', 'hs256')).rejects.toThrow(jose.errors.JWSInvalid)
    })
    it('JWSExpired',async ()=>{
      const token = await service.sign({foo: 'bar'}, 'secret', 'access', '1s' ,'HS256', 'vastsea')
      return new Promise((resolve)=>{
        setTimeout(() => {
          expect(service.verify(token, 'secret', 'HS256')).rejects.toThrow(jose.errors.JWTExpired)
          resolve(null);
        }, 2000);
      })
    })
    it('secret wrong', async () => {
      const token = await service.sign({foo: 'bar'}, 'secret', 'access', '1s' ,'HS256', 'vastsea')
      expect(service.verify(token, 'secret-', 'HS256')).rejects.toThrow(jose.errors.JWSSignatureVerificationFailed)
    })
  })
  it('decode', async () => {
    const token = await service.sign({foo: 'bar'}, 'secret', 'access', '1s' ,'HS256', 'vastsea')
    expect(service.decode<{foo: string}>(token).foo).toBe('bar')
  })
});