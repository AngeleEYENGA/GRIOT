import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArbresService } from './arbres.service';
import { CreateArbreDto } from './dto/create-arbre.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('arbres')
@ApiBearerAuth()
@Controller('arbres')
export class ArbresController {
  constructor(private readonly arbresService: ArbresService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateArbreDto) {
    return this.arbresService.create(req.user.id, dto);
  }

  @Get()
  findMine(@Req() req) {
    return this.arbresService.findAllForUser(req.user.id);
  }

  @Get(':arbreId')
  findOne(@Param('arbreId') arbreId: string, @Req() req) {
    return this.arbresService.findOne(arbreId, req.user.id);
  }
}
