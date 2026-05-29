import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMeetingProviderConfigDto {
  @IsOptional()
  @IsIn(['google', 'zoom', 'teams'])
  provider?: 'google' | 'zoom' | 'teams';

  @IsOptional()
  @IsString()
  nombre?: string;

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