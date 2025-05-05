import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateListDto } from './dto/create-list.dto';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateListDto) {
    return this.prisma.todoList.create({
      data: {
        name: dto.name,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.todoList.findMany({
      where: { userId },
      include: {
        todos: true,
      },
    });
  }

  async findOne(userId: string, listId: string) {
    return this.prisma.todoList.findFirst({
      where: { id: listId, userId },
      include: { todos: true },
    });
  }

  async remove(userId: string, listId: string) {
    const list = await this.prisma.todoList.findFirst({
      where: { id: listId, userId },
    });
    if (!list) {
      throw new UnauthorizedException({
        code: 'LIST_NOT_FOUND',
        message: 'List not found',
      });
    }
    await this.prisma.$transaction([
      this.prisma.todo.deleteMany({
        where: { listId },
      }),
      this.prisma.todoList.delete({
        where: { id: listId },
      }),
    ]);
    return list;
  }
}
