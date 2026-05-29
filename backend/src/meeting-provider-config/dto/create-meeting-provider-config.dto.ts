import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeetingProviderConfigDto {
  @Type(() => Number)
  @IsInt()
  idempresa: number;

  @IsIn(['google', 'zoom', 'teams'])
  provider: 'google' | 'zoom' | 'teams';

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  predeterminado?: boolean;

  @IsOptional()
  @IsString()
  authType?: string | null;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}