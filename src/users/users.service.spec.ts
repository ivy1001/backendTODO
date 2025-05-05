import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockPrismaService } from 'src/__mocks__/mockPrismaService';

const mockUser = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user if email does not exist', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
    mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

    const result = await service.create({
      email: mockUser.email,
      password: 'plain',
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw error if email already exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
    await expect(
      service.create({ email: mockUser.email, password: 'plain' }),
    ).rejects.toThrow('Email already exists');
  });

  it('should update a user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
    mockPrismaService.user.update.mockResolvedValueOnce({
      ...mockUser,
      firstName: 'Updated',
    });
    const result = await service.update('1', { firstName: 'Updated' });
    expect(result.firstName).toBe('Updated');
  });

  it('should return all users', async () => {
    mockPrismaService.user.findMany.mockResolvedValueOnce([mockUser]);
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
  });

  it('should find a user by email', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
    const result = await service.findByEmail(mockUser.email);
    expect(result).toEqual(mockUser);
  });

  it('should find a user by ID', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
    const result = await service.findById(mockUser.id);
    expect(result).toEqual(mockUser);
  });
});
