import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2024-12-31T23:59:59Z' })
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Work' })
  list?: string;
}
