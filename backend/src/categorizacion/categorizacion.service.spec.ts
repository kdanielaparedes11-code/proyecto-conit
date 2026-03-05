import { Test, TestingModule } from '@nestjs/testing';
import { CategorizacionService } from './categorizacion.service';

describe('CategorizacionService', () => {
  let service: CategorizacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorizacionService],
    }).compile();

    service = module.get<CategorizacionService>(CategorizacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
