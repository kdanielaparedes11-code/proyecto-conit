import { Test, TestingModule } from '@nestjs/testing';
import { CategorizacionController } from './categorizacion.controller';

describe('CategorizacionController', () => {
  let controller: CategorizacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorizacionController],
    }).compile();

    controller = module.get<CategorizacionController>(CategorizacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
