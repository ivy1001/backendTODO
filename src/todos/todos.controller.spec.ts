import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

const mockUser = { userId: '1', email: 'test@example.com' };
const mockReq = { user: mockUser } as Partial<Request> as AuthenticatedRequest;
const mockTodo = { id: '1', title: 'Test Todo', completed: false };

describe('TodosController', () => {
  let controller: TodosController;
  let service: Partial<TodosService>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockTodo),
      findAll: jest.fn().mockResolvedValue([mockTodo]),
      findOne: jest.fn().mockResolvedValue(mockTodo),
      update: jest.fn().mockResolvedValue({ count: 1 }),
      remove: jest.fn().mockResolvedValue({ count: 1 }),
      getStats: jest.fn().mockResolvedValue({ total: 1, completed: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: service }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should create a todo', async () => {
    const dto: CreateTodoDto = { title: 'Test Todo', list: '1' };
    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(mockTodo);
  });

  it('should return all todos', async () => {
    const result = await controller.findAll(mockReq, {});
    expect(result).toEqual([mockTodo]);
  });

  it('should return todo stats', async () => {
    const result = await controller.getStats(mockReq);
    expect(result).toEqual({ total: 1, completed: 0 });
  });

  it('should return a specific todo by id', async () => {
    const result = await controller.findOne(mockReq, '1');
    expect(result).toEqual(mockTodo);
  });

  it('should update a todo by id', async () => {
    const dto: UpdateTodoDto = { title: 'Updated Todo' };
    const result = await controller.update(mockReq, '1', dto);
    expect(result.count).toBe(1);
  });

  it('should remove a todo by id', async () => {
    const result = await controller.remove(mockReq, '1');
    expect(result.count).toBe(1);
  });
});
