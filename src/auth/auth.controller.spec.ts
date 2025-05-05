import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request } from 'express';

const mockUser = {
  id: '1',
  email: 'test@example.com',
};
interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn().mockResolvedValue(mockUser),
      login: jest
        .fn()
        .mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
      refreshToken: jest.fn().mockResolvedValue({ access_token: 'new_token' }),
      logout: jest.fn().mockResolvedValue(undefined),
      requestPasswordReset: jest
        .fn()
        .mockResolvedValue({ reset_token: 'resetToken' }),
      resetPassword: jest
        .fn()
        .mockResolvedValue({ message: 'Password reset successful' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should login and return tokens', async () => {
    const result = await authController.login({
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(result).toEqual({ access_token: 'token', refresh_token: 'refresh' });
  });

  it('should return current user info from getMe', () => {
    const mockReq = {
      user: { userId: '1', email: 'test@example.com' },
    } as Partial<AuthenticatedRequest> as AuthenticatedRequest;
    const result = authController.getMe(mockReq);
    expect(result).toEqual({ id: '1', email: 'test@example.com' });
  });

  it('should refresh token', async () => {
    const result = await authController.refresh({ refresh_token: 'refresh' });
    expect(result).toEqual({ access_token: 'new_token' });
  });

  it('should logout successfully', async () => {
    const mockReq = {
      user: { userId: '1', email: 'test@example.com' },
    } as Partial<AuthenticatedRequest> as AuthenticatedRequest;
    const result = await authController.logout(mockReq);
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('should request password reset and return token', async () => {
    const result = await authController.forgotPassword({
      email: 'test@example.com',
    });
    expect(result).toEqual({ reset_token: 'resetToken' });
  });

  it('should reset password and return success message', async () => {
    const result = await authController.resetPassword({
      token: 'token',
      newPassword: 'NewPassword123',
    });
    expect(result).toEqual({ message: 'Password reset successful' });
  });
});
