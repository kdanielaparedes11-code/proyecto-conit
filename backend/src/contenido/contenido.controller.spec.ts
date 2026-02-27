import { Test, TestingModule } from '@nestjs/testing';
import { ContenidoController } from './contenido.controller';

describe('ContenidoController', () => {
  let controller: ContenidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContenidoController],
    }).compile();

    controller = module.get<ContenidoController>(ContenidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
