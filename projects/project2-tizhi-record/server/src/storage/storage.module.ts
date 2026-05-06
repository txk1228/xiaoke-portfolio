import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { BodyMetricsService } from './body-metrics.service';
import { LlmService } from './llm.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService, BodyMetricsService, LlmService],
  exports: [StorageService, BodyMetricsService, LlmService],
})
export class StorageModule {}
