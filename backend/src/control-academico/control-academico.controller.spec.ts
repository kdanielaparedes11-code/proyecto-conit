import { Test, TestingModule } from '@nestjs/testing';
import { ControlAcademicoController } from './control-academico.controller';

describe('ControlAcademicoController', () => {
  let controller: ControlAcademicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControlAcademicoController],
    }).compile();

    controller = module.get<ControlAcademicoController>(ControlAcademicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
