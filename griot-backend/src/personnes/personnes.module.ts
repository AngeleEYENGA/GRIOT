import { Module } from '@nestjs/common';
import { PersonnesService } from './personnes.service';
import { PersonnesController } from './personnes.controller';

@Module({
  controllers: [PersonnesController],
  providers: [PersonnesService],
})
export class PersonnesModule {}
