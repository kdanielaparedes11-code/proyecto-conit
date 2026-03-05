import { Test, TestingModule } from '@nestjs/testing';
import { TemarioController } from './temario.controller';

describe('TemarioController', () => {
  let controller: TemarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemarioController],
    }).compile();

    controller = module.get<TemarioController>(TemarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
