import { Test, TestingModule } from '@nestjs/testing';
import { DetalleMatriculaController } from './detalle-matricula.controller';

describe('DetalleMatriculaController', () => {
  let controller: DetalleMatriculaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleMatriculaController],
    }).compile();

    controller = module.get<DetalleMatriculaController>(DetalleMatriculaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
