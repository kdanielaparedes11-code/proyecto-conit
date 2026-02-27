import { Test, TestingModule } from '@nestjs/testing';
import { ComprobantePagoController } from './comprobante-pago.controller';

describe('ComprobantePagoController', () => {
  let controller: ComprobantePagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComprobantePagoController],
    }).compile();

    controller = module.get<ComprobantePagoController>(ComprobantePagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
