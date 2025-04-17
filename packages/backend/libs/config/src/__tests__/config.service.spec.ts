import { Test } from '@nestjs/testing';
import { ConfigService } from '../config.service';
import { MODULE_OPTIONS_TOKEN } from '../config.option';

describe('ConfigService', () => {
  let service: ConfigService;

  const mockLoader = jest.fn().mockReturnValue({
    database: {
      host: 'localhost',
      port: 5432,
    },
  });
  const mockOptions = {
    loader: mockLoader,
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: mockOptions,
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    const result = service.get('database.host' as any);
    expect(result).toBe('localhost');
  });
  it('should tobe null', () => {
    const result = service.get('hh' as any);
    expect(result).toBeNull();
  });
});
