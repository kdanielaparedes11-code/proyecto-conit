import { Test, TestingModule } from '@nestjs/testing';
import { ContenidoService } from './contenido.service';

describe('ContenidoService', () => {
  let service: ContenidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContenidoService],
    }).compile();

    service = module.get<ContenidoService>(ContenidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
