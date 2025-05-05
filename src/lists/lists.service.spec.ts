import { Test, TestingModule } from '@nestjs/testing';
import { ListsService } from './lists.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { mockPrismaService } from '../__mocks__/mockPrismaService';

const mockList = { id: '1', name: 'Groceries', userId: '1', todos: [] };

describe('ListsService', () => {
  let service: ListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
  });

  it('should create a list', async () => {
    mockPrismaService.todoList.create.mockResolvedValueOnce(mockList);
    const result = await service.create('1', { name: 'Groceries' });
    expect(result).toEqual(mockList);
  });

  it('should return all lists for a user', async () => {
    mockPrismaService.todoList.findMany.mockResolvedValueOnce([mockList]);
    const result = await service.findAll('1');
    expect(result).toEqual([mockList]);
  });

  it('should return a specific list by id', async () => {
    mockPrismaService.todoList.findFirst.mockResolvedValueOnce(mockList);
    const result = await service.findOne('1', '1');
    expect(result).toEqual(mockList);
  });

  it('should remove a list and related todos', async () => {
    mockPrismaService.todoList.findFirst.mockResolvedValueOnce(mockList);
    mockPrismaService.$transaction.mockResolvedValueOnce([{}, mockList]);

    const result = await service.remove('1', '1');
    expect(mockPrismaService.$transaction).toHaveBeenCalled();
    expect(result).toEqual(mockList);
  });

  it('should throw if list not found for deletion', async () => {
    mockPrismaService.todoList.findFirst.mockResolvedValueOnce(null);
    await expect(service.remove('1', 'not_found')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
