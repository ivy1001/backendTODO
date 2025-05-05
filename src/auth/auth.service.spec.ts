import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';

const typedBcrypt = bcrypt;

const mockUser = {
  id: '1',
  email: 'user@example.com',
  password: typedBcrypt.hashSync('Password123', 10),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let cacheManager: Partial<Cache>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(true),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
      verify: jest
        .fn()
        .mockReturnValue({ email: mockUser.email, sub: mockUser.id }),
    };

    cacheManager = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue('refresh-token'),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should validate user with correct credentials', async () => {
    const result = await authService.validateUser(
      mockUser.email,
      'Password123',
    );
    expect(result).toEqual(mockUser);
  });

  it('should throw if user not found', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(null);
    await expect(
      authService.validateUser('wrong@example.com', 'Password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if password is invalid', async () => {
    await expect(
      authService.validateUser(mockUser.email, 'wrong'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should login and return tokens', async () => {
    const result = await authService.login(mockUser);
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });

  it('should refresh token if valid', async () => {
    cacheManager.get = jest.fn().mockResolvedValueOnce('refresh-token');
    const result = await authService.refreshToken('refresh-token');
    expect(result).toHaveProperty('access_token');
  });

  it('should throw if refresh token is invalid or mismatched', async () => {
    cacheManager.get = jest.fn().mockResolvedValueOnce(null);
    await expect(authService.refreshToken('invalid')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should logout and clear refresh token', async () => {
    await authService.logout(mockUser.id);
    expect(cacheManager.del).toHaveBeenCalledWith(`refresh:${mockUser.id}`);
  });

  it('should request password reset and return token', async () => {
    jwtService.sign = jest.fn().mockReturnValue('reset-token');
    const result = await authService.requestPasswordReset(mockUser.email);
    expect(result).toEqual({ reset_token: 'reset-token' });
  });

  it('should throw if token verification returns null', async () => {
    jwtService.verify = jest.fn().mockReturnValueOnce(null);
    await expect(
      authService.resetPassword('bad-token', 'newpass'),
    ).rejects.toThrow('Invalid reset token');
  });

  it('should throw if user from token not found', async () => {
    jwtService.verify = jest
      .fn()
      .mockReturnValueOnce({ email: 'x@y.com', sub: '1' });
    usersService.findByEmail = jest.fn().mockResolvedValueOnce(null);
    await expect(
      authService.resetPassword('valid-token', 'newpass'),
    ).rejects.toThrow('Invalid email or password');
  });

  it('should reset password successfully', async () => {
    jwtService.verify = jest
      .fn()
      .mockReturnValueOnce({ email: mockUser.email, sub: mockUser.id });
    usersService.findByEmail = jest.fn().mockResolvedValueOnce(mockUser);
    usersService.update = jest.fn().mockResolvedValue(true);
    jest.mock('bcrypt', () => {
      const actualBcrypt =
        jest.requireActual<typeof import('bcrypt')>('bcrypt');
      return {
        ...actualBcrypt,
        hash: jest.fn().mockResolvedValue('hashed'),
      };
    });
    const result = await authService.resetPassword('token', 'newpass');
    expect(result).toEqual({ message: 'Password reset successful' });
  });
});
