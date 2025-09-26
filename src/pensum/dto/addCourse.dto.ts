import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCourseDto {
  @ApiProperty({
    description: 'User ID of the admin adding the course',
    example: '64f8a1234567890abcdef123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Semester number where the course will be added',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  semesterNumber: number;

  @ApiProperty({
    description: 'Name of the course to add',
    example: 'Advanced Mathematics',
  })
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({
    description: 'Type of course',
    enum: ['B', 'E'],
    example: 'B',
    enumName: 'CourseType',
  })
  @IsEnum(['B', 'E'])
  courseType: 'B' | 'E';
}
