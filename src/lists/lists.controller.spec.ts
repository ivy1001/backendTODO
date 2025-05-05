import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

const mockReq: AuthenticatedRequest = {
  user: { userId: '1', email: 'test@example.com' },
} as AuthenticatedRequest;

const mockList = { id: '1', name: 'Groceries', userId: '1' };

describe('ListsController', () => {
  let controller: ListsController;
  let service: Partial<ListsService>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockList),
      findAll: jest.fn().mockResolvedValue([mockList]),
      findOne: jest.fn().mockResolvedValue(mockList),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [{ provide: ListsService, useValue: service }],
    }).compile();

    controller = module.get<ListsController>(ListsController);
  });

  it('should create a list', async () => {
    const dto: CreateListDto = { name: 'Groceries' };
    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(mockList);
  });

  it('should return all lists for a user', async () => {
    const result = await controller.findAll(mockReq);
    expect(result).toEqual([mockList]);
  });

  it('should return a single list by id', async () => {
    const result = await controller.findOne(mockReq, '1');
    expect(result).toEqual(mockList);
  });

  it('should delete a list by id', async () => {
    const result = await controller.delete(mockReq, '1');
    expect(result).toEqual({ deleted: true });
  });
});
