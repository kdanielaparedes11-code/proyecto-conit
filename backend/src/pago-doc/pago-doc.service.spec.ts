import { Test, TestingModule } from '@nestjs/testing';
import { PagoDocService } from './pago-doc.service';

describe('PagoDocService', () => {
  let service: PagoDocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagoDocService],
    }).compile();

    service = module.get<PagoDocService>(PagoDocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
