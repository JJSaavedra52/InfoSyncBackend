import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  userEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  userName: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string; // Plain password, hash in service

  @ApiProperty({ enum: ['student', 'admin'] })
  @IsEnum(['student', 'admin'])
  role: 'student' | 'admin';
}
