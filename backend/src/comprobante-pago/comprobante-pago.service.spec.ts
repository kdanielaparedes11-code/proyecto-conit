import { Test, TestingModule } from '@nestjs/testing';
import { ComprobantePagoService } from './comprobante-pago.service';

describe('ComprobantePagoService', () => {
  let service: ComprobantePagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComprobantePagoService],
    }).compile();

    service = module.get<ComprobantePagoService>(ComprobantePagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
