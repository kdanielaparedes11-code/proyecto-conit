import { Test, TestingModule } from '@nestjs/testing';
import { TareaEntregaController } from './tarea-entrega.controller';
import { TareaEntregaService } from './tarea-entrega.service';

describe('TareaEntregaController', () => {
  let controller: TareaEntregaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TareaEntregaController],
      providers: [TareaEntregaService],
    }).compile();

    controller = module.get<TareaEntregaController>(TareaEntregaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
