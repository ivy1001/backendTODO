import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [TodosController],
  providers: [TodosService],
  imports: [PrismaModule, CacheModule.register()],
})
export class TodosModule {}
