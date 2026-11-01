import { Module } from '@nestjs/common';
import { GeographieController } from './geographie.controller';
import { GeographieService } from './geographie.service';

@Module({
  controllers: [GeographieController],
  providers: [GeographieService],
})
export class GeographieModule {}
