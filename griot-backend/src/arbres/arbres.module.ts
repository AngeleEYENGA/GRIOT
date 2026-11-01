import { Module } from '@nestjs/common';
import { ArbresService } from './arbres.service';
import { ArbresController } from './arbres.controller';
import { PublicArbresController } from './public-arbres.controller';

@Module({
  controllers: [PublicArbresController, ArbresController],
  providers: [ArbresService],
  exports: [ArbresService],
})
export class ArbresModule {}
