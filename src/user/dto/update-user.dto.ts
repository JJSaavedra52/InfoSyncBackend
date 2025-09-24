import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(6)
  password?: string; // Plain password, will be hashed

  @ApiPropertyOptional()
  @IsString()
  passwordHash?: string;

  @ApiPropertyOptional({ enum: ['student', 'admin'] })
  @IsEnum(['student', 'admin'])
  role?: 'student' | 'admin';

  @ApiPropertyOptional({ enum: ['active', 'banned'] })
  @IsEnum(['active', 'banned'])
  status?: 'active' | 'banned';

  @ApiPropertyOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  userName?: string;
}
