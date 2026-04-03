import { Test, TestingModule } from '@nestjs/testing';
import { PensionService } from './pension.service';

describe('PensionService', () => {
  let service: PensionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PensionService],
    }).compile();

    service = module.get<PensionService>(PensionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
