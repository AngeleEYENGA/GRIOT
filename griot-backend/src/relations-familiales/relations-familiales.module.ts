import { Module } from '@nestjs/common';
import { RelationsFamilialesService } from './relations-familiales.service';
import { RelationsFamilialesController } from './relations-familiales.controller';

@Module({
  controllers: [RelationsFamilialesController],
  providers: [RelationsFamilialesService],
})
export class RelationsFamilialesModule {}
