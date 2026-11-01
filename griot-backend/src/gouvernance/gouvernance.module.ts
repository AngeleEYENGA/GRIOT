import { Module } from '@nestjs/common';
import { GouvernanceController } from './gouvernance.controller';
import { GouvernanceService } from './gouvernance.service';

@Module({
  controllers: [GouvernanceController],
  providers: [GouvernanceService],
})
export class GouvernanceModule {}
