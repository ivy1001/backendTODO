import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from 'src/common/exceptions/error-code';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }
    return user;
  }

  async login(user: { email: string; id: string }) {
    const payload: JwtPayload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.cacheManager.set(
      `refresh:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    let decoded: JwtPayload;

    try {
      decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_TOKEN,
        message: 'Invalid refresh token',
      });
    }

    const stored = await this.cacheManager.get<string>(
      `refresh:${decoded.sub}`,
    );

    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_TOKEN,
        message: 'Invalid refresh token',
      });
    }

    const newAccessToken = this.jwtService.sign({
      sub: decoded.sub,
      email: decoded.email,
    });

    return { access_token: newAccessToken };
  }

  async logout(userId: string) {
    await this.cacheManager.del(`refresh:${userId}`);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const resetToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
      },
      {
        secret: process.env.JWT_RESET_SECRET,
        expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
      },
    );

    return { reset_token: resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const decoded = this.jwtService.verify<JwtPayload>(token, {
      secret: process.env.JWT_RESET_SECRET,
    });
    if (!decoded) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_TOKEN,
        message: 'Invalid reset token',
      });
    }

    const user = await this.usersService.findByEmail(decoded.email);
    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(decoded.sub, { password: hashed });

    return { message: 'Password reset successful' };
  }
}
