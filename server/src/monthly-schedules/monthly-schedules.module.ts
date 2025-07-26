import { Module } from '@nestjs/common';
import { MonthlySchedulesController } from './monthly-schedules.controller';
import { MonthlySchedulesService } from './monthly-schedules.service';

@Module({
  controllers: [MonthlySchedulesController],
  providers: [MonthlySchedulesService],
  exports: [MonthlySchedulesService],
})
export class MonthlySchedulesModule {} 