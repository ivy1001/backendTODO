import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUser = { id: '1', email: 'user@example.com', name: 'Test User' };

describe('UsersController', () => {
  let controller: UsersController;
  let service: Partial<UsersService>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockUser, name: 'Updated Name' }),
      findAll: jest.fn().mockResolvedValue([mockUser]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'user@example.com',
      password: '123456',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = { firstName: 'Updated', language: 'fr' };
    const expectedResult = {
      ...mockUser,
      firstName: 'Updated',
      language: 'fr',
    };

    (service.update as jest.Mock).mockResolvedValue(expectedResult);

    const result = await controller.update('1', dto);
    expect(result.firstName).toBe('Updated');
    expect(result.language).toBe('fr');
  });
  it('should return all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
  });
});
