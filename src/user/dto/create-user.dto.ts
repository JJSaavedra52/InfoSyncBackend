import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @Matches(/^[\w.-]+@uao\.edu\.co$/, {
    message: 'Email must be an institutional @uao.edu.co address',
  })
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
