import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // Plain password, will be hashed

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passwordHash?: string;

  @ApiPropertyOptional({ enum: ['student', 'admin'] })
  @IsOptional()
  @IsEnum(['student', 'admin'])
  role?: 'student' | 'admin';

  @ApiPropertyOptional({ enum: ['active', 'banned'] })
  @IsOptional()
  @IsEnum(['active', 'banned'])
  status?: 'active' | 'banned';

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userName?: string;
}
