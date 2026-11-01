import { Module } from '@nestjs/common';
import { MembresArbreService } from './membres-arbre.service';
import { MembresArbreController } from './membres-arbre.controller';

@Module({
  controllers: [MembresArbreController],
  providers: [MembresArbreService],
})
export class MembresArbreModule {}
