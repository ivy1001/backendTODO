import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(UserId: string, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: UserId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${UserId} not found`);
    }

    return this.prisma.user.update({
      where: { id: UserId },
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: false,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });
  }
  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
