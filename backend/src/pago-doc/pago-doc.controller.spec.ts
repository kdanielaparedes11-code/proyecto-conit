import { Test, TestingModule } from '@nestjs/testing';
import { PagoDocController } from './pago-doc.controller';

describe('PagoDocController', () => {
  let controller: PagoDocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagoDocController],
    }).compile();

    controller = module.get<PagoDocController>(PagoDocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
