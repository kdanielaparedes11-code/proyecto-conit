import { Test, TestingModule } from '@nestjs/testing';
import { PensionController } from './pension.controller';
import { PensionService } from './pension.service';

describe('PensionController', () => {
  let controller: PensionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PensionController],
      providers: [PensionService],
    }).compile();

    controller = module.get<PensionController>(PensionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
