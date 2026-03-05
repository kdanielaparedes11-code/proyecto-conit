import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoPrevioService } from './requisito-previo.service';

describe('RequisitoPrevioService', () => {
  let service: RequisitoPrevioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisitoPrevioService],
    }).compile();

    service = module.get<RequisitoPrevioService>(RequisitoPrevioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
