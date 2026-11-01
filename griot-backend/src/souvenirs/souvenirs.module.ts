import { Module } from '@nestjs/common';
import { SouvenirsController } from './souvenirs.controller';
import { SouvenirsService } from './souvenirs.service';

@Module({ controllers: [SouvenirsController], providers: [SouvenirsService] })
export class SouvenirsModule {}
