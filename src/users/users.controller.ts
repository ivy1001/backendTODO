import { Body, Controller, Post, Patch, Param, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('Received DTO:', createUserDto);
    return this.usersService.create(createUserDto);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('Received DTO:', updateUserDto);
    return this.usersService.update(id, updateUserDto);
  }
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
