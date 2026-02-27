import { Test, TestingModule } from '@nestjs/testing';
import { UnidadController } from './unidad.controller';

describe('UnidadController', () => {
  let controller: UnidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadController],
    }).compile();

    controller = module.get<UnidadController>(UnidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
