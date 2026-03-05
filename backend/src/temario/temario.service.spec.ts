import { Test, TestingModule } from '@nestjs/testing';
import { TemarioService } from './temario.service';

describe('TemarioService', () => {
  let service: TemarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemarioService],
    }).compile();

    service = module.get<TemarioService>(TemarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
