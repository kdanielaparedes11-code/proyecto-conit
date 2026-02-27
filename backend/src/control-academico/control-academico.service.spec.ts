import { Test, TestingModule } from '@nestjs/testing';
import { ControlAcademicoService } from './control-academico.service';

describe('ControlAcademicoService', () => {
  let service: ControlAcademicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControlAcademicoService],
    }).compile();

    service = module.get<ControlAcademicoService>(ControlAcademicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
