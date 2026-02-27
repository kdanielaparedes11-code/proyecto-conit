import { Test, TestingModule } from '@nestjs/testing';
import { DetalleMatriculaService } from './detalle-matricula.service';

describe('DetalleMatriculaService', () => {
  let service: DetalleMatriculaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleMatriculaService],
    }).compile();

    service = module.get<DetalleMatriculaService>(DetalleMatriculaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
