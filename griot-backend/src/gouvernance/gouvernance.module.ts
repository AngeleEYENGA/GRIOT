import { Module } from '@nestjs/common';
import { GouvernanceController } from './gouvernance.controller';
import { GouvernanceService } from './gouvernance.service';
import { InstitutionSpaceController } from './institution-space.controller';

@Module({
  controllers: [GouvernanceController, InstitutionSpaceController],
  providers: [GouvernanceService],
})
export class GouvernanceModule {}
