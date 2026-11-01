import { Module } from '@nestjs/common';
import { ArbresService } from './arbres.service';
import { ArbresController } from './arbres.controller';

@Module({
  controllers: [ArbresController],
  providers: [ArbresService],
  exports: [ArbresService],
})
export class ArbresModule {}
