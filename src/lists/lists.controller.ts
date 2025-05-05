import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateListDto) {
    return this.listsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.listsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listsService.findOne(req.user.userId, id);
  }

  @Delete(':id')
  delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listsService.remove(req.user.userId, id);
  }
}
