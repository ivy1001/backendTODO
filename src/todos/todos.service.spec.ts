import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { mockPrismaService } from '../__mocks__/mockPrismaService';

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockTodo = { id: '1', title: 'Test Todo', userId: '1', done: false };

describe('TodosService', () => {
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should create a todo with an existing list', async () => {
    mockPrismaService.todoList.findFirst.mockResolvedValueOnce({ id: 'list1' });
    mockPrismaService.todo.create.mockResolvedValueOnce(mockTodo);

    const result = await service.create('1', {
      title: 'New Todo',
      list: 'Work',
    });
    expect(result).toEqual(mockTodo);
  });

  it('should throw if list not found during create', async () => {
    mockPrismaService.todoList.findFirst.mockResolvedValueOnce(null);
    await expect(
      service.create('1', { title: 'New Todo', list: 'Unknown' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should get all todos with query filters', async () => {
    mockPrismaService.todo.findMany.mockResolvedValueOnce([mockTodo]);
    const result = await service.findAll('1', {});
    expect(result).toEqual([mockTodo]);
  });

  it('should get one todo by id', async () => {
    mockPrismaService.todo.findFirst.mockResolvedValueOnce(mockTodo);
    const result = await service.findOne('1', '1');
    expect(result).toEqual(mockTodo);
  });

  it('should update a todo', async () => {
    mockPrismaService.todo.updateMany.mockResolvedValueOnce({ count: 1 });
    const result = await service.update('1', '1', { title: 'Updated' });
    expect(result.count).toBe(1);
  });

  it('should delete a todo', async () => {
    mockPrismaService.todo.deleteMany.mockResolvedValueOnce({ count: 1 });
    const result = await service.remove('1', '1');
    expect(result.count).toBe(1);
  });

  it('should return stats from cache if exists', async () => {
    mockCache.get.mockResolvedValueOnce({ total: 5, completed: 3, pending: 2 });
    const result = await service.getStats('1');
    expect(result).toEqual({ total: 5, completed: 3, pending: 2 });
  });

  it('should create a todo without list', async () => {
    mockPrismaService.todo.create.mockResolvedValueOnce(mockTodo);
    const result = await service.create('1', {
      title: 'No list',
    });
    expect(result).toEqual(mockTodo);
  });

  it('should get filtered todos with done, priority, dueBefore, and dueAfter', async () => {
    mockPrismaService.todo.findMany.mockResolvedValueOnce([mockTodo]);
    const result = await service.findAll('1', {
      done: 'true',
      priority: '1',
      dueBefore: new Date().toISOString(),
      dueAfter: new Date().toISOString(),
      sortBy: 'title',
      order: 'asc',
      skip: '0',
      take: '5',
    });
    expect(result).toEqual([mockTodo]);
  });
  it('should calculate and cache stats if not cached', async () => {
    mockCache.get.mockResolvedValueOnce(null);
    mockPrismaService.todo.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1);

    const result = await service.getStats('1');
    expect(result).toEqual({ total: 4, completed: 1, pending: 3 });
    expect(mockCache.set).toHaveBeenCalled();
  });
});
