import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ArbresModule } from './arbres/arbres.module';
import { MembresArbreModule } from './membres-arbre/membres-arbre.module';
import { PersonnesModule } from './personnes/personnes.module';
import { RelationsFamilialesModule } from './relations-familiales/relations-familiales.module';
import { AppController } from './app.controller';
import { AiModule } from './ai/ai.module';
import { SouvenirsModule } from './souvenirs/souvenirs.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ArbresModule,
    MembresArbreModule,
    PersonnesModule,
    RelationsFamilialesModule,
    AiModule,
    SouvenirsModule,
  ],
})
export class AppModule {}
