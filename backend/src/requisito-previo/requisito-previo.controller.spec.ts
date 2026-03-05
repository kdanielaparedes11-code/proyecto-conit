import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoPrevioController } from './requisito-previo.controller';

describe('RequisitoPrevioController', () => {
  let controller: RequisitoPrevioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisitoPrevioController],
    }).compile();

    controller = module.get<RequisitoPrevioController>(RequisitoPrevioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
