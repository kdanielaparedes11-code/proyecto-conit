import { Test, TestingModule } from '@nestjs/testing';
import { ExamenController } from './examen.controller';

describe('ExamenController', () => {
  let controller: ExamenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenController],
    }).compile();

    controller = module.get<ExamenController>(ExamenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
