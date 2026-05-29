import { Test, TestingModule } from '@nestjs/testing';
import { TareaEntregaService } from './tarea-entrega.service';

describe('TareaEntregaService', () => {
  let service: TareaEntregaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TareaEntregaService],
    }).compile();

    service = module.get<TareaEntregaService>(TareaEntregaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
