import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingProviderConfig } from './entities/meeting-provider-config.entity';
import { MeetingProviderConfigService } from './meeting-provider-config.service';
import { MeetingProviderConfigController } from './meeting-provider-config.controller';
import { EncryptionService } from '../common/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingProviderConfig])],
  controllers: [MeetingProviderConfigController],
  providers: [MeetingProviderConfigService, EncryptionService],
  exports: [MeetingProviderConfigService],
})
export class MeetingProviderConfigModule {}