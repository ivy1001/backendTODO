/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_CODES } from 'src/common/exceptions/error-code';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(userId: string, dto: CreateTodoDto) {
    const { list, ...rest } = dto;

    let listId: string | undefined;

    if (list) {
      const existingList = await this.prisma.todoList.findFirst({
        where: { name: list, userId },
      });

      if (!existingList) {
        throw new UnauthorizedException({
          code: ERROR_CODES.TODO.LIST_NOT_FOUND,
          message: 'List not found',
        });
      }

      listId = existingList.id;
    }
    const existingTodo = await this.prisma.todo.findFirst({
      where: {
        userId,
        title: dto.title,
      },
    });
    console.log('dto.title', dto.title);

    if (existingTodo) {
      throw new UnauthorizedException({
        code: ERROR_CODES.TODO.TITLE_ALREADY_EXISTS,
        message: 'A TODO with this title already exists.',
      });
    }
    await this.cacheManager.del(`stats:${userId}`);
    return this.prisma.todo.create({
      data: {
        ...rest,
        userId,
        ...(listId && { listId }),
      },
    });
  }

  async findAll(userId: string, query: any) {
    const {
      done,
      priority,
      dueBefore,
      dueAfter,
      sortBy = 'createdAt',
      order = 'desc',
      skip = 0,
      take = 10,
    } = query;

    return this.prisma.todo.findMany({
      where: {
        userId,
        ...(done !== undefined && { done: done === 'true' }),
        ...(priority && { priority: Number(priority) }),
        ...(dueBefore && { dueDate: { lt: new Date(dueBefore) } }),
        ...(dueAfter && { dueDate: { gt: new Date(dueAfter) } }),
      },
      orderBy: {
        [sortBy]: order === 'asc' ? 'asc' : 'desc',
      },
      skip: Number(skip),
      take: Number(take),
    });
  }
  async findOne(userId: string, id: string) {
    return this.prisma.todo.findFirst({ where: { id, userId } });
  }

  async update(userId: string, id: string, dto: UpdateTodoDto) {
    await this.cacheManager.del(`stats:${userId}`);

    return this.prisma.todo.updateMany({
      where: { id, userId },
      data: dto,
    });
  }
  async remove(userId: string, id: string) {
    await this.cacheManager.del(`stats:${userId}`);
    return this.prisma.todo.deleteMany({ where: { id, userId } });
  }
  async getStats(userId: string) {
    const cacheKey = `stats:${userId}`;
    const cashed = await this.cacheManager.get(cacheKey);
    if (cashed) {
      return cashed;
    }
    const [total, completed] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, done: true } }),
    ]);

    const stats = {
      total,
      completed,
      pending: total - completed,
    };
    await this.cacheManager.set(cacheKey, stats, 60);
    console.log('Cached stats:', cacheKey, stats);
    return stats;
  }
}
