import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionController } from './evaluacion.controller';

describe('EvaluacionController', () => {
  let controller: EvaluacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluacionController],
    }).compile();

    controller = module.get<EvaluacionController>(EvaluacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
