import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionService } from './evaluacion.service';

describe('EvaluacionService', () => {
  let service: EvaluacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluacionService],
    }).compile();

    service = module.get<EvaluacionService>(EvaluacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
