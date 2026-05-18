import { IsNotEmpty, IsString } from 'class-validator';

export class GuardarReaccionForoDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;
}