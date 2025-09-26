import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourseDto {
  @ApiProperty({
    description: 'Name of the course',
    example: 'Mathematics I',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Type of course',
    enum: ['B', 'E'],
    example: 'B',
    enumName: 'CourseType',
  })
  @IsEnum(['B', 'E'])
  type: 'B' | 'E';
}

export class SemesterDto {
  @ApiProperty({
    description: 'Semester number',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  semesterNumber: number;

  @ApiProperty({
    description: 'List of courses in this semester (minimum 5 courses)',
    type: [CourseDto],
    minItems: 5,
    example: [
      { name: 'Mathematics I', type: 'B' },
      { name: 'Physics I', type: 'B' },
      { name: 'Chemistry I', type: 'B' },
      { name: 'Programming I', type: 'B' },
      { name: 'English I', type: 'E' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseDto)
  courses: CourseDto[];
}

export class CreatePensumDto {
  @ApiProperty({
    description: 'User ID of the admin creating the pensum',
    example: '64f8a1234567890abcdef123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Name of the pensum (must be unique)',
    example: 'Computer Science Program 2024',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50)
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description:
      'Total number of semesters in the pensum (must match the semesters array length)',
    example: 9,
    minimum: 9,
    maximum: 12,
    default: 9,
  })
  @IsOptional()
  @IsNumber()
  @Min(9)
  @Max(12)
  totalSemesters?: number;

  @ApiProperty({
    description:
      'Array of semesters with their courses (minimum 9 semesters, each with at least 5 courses). Semester numbers must be sequential starting from 1.',
    type: [SemesterDto],
    minItems: 9,
    example: [
      {
        semesterNumber: 1,
        courses: [
          { name: 'Mathematics I', type: 'B' },
          { name: 'Physics I', type: 'B' },
          { name: 'Chemistry I', type: 'B' },
          { name: 'Programming I', type: 'B' },
          { name: 'English I', type: 'E' },
        ],
      },
      {
        semesterNumber: 2,
        courses: [
          { name: 'Mathematics II', type: 'B' },
          { name: 'Physics II', type: 'B' },
          { name: 'Chemistry II', type: 'B' },
          { name: 'Programming II', type: 'B' },
          { name: 'English II', type: 'E' },
        ],
      },
      {
        semesterNumber: 3,
        courses: [
          { name: 'Mathematics III', type: 'B' },
          { name: 'Physics III', type: 'B' },
          { name: 'Chemistry III', type: 'B' },
          { name: 'Data Structures', type: 'B' },
          { name: 'Technical Writing', type: 'E' },
        ],
      },
      {
        semesterNumber: 4,
        courses: [
          { name: 'Calculus', type: 'B' },
          { name: 'Electronics', type: 'B' },
          { name: 'Database Systems', type: 'B' },
          { name: 'Algorithms', type: 'B' },
          { name: 'Ethics', type: 'E' },
        ],
      },
      {
        semesterNumber: 5,
        courses: [
          { name: 'Linear Algebra', type: 'B' },
          { name: 'Computer Networks', type: 'B' },
          { name: 'Software Engineering', type: 'B' },
          { name: 'Operating Systems', type: 'B' },
          { name: 'Philosophy', type: 'E' },
        ],
      },
      {
        semesterNumber: 6,
        courses: [
          { name: 'Statistics', type: 'B' },
          { name: 'Web Development', type: 'B' },
          { name: 'Machine Learning', type: 'B' },
          { name: 'Computer Graphics', type: 'B' },
          { name: 'Art History', type: 'E' },
        ],
      },
      {
        semesterNumber: 7,
        courses: [
          { name: 'Artificial Intelligence', type: 'B' },
          { name: 'Mobile Development', type: 'B' },
          { name: 'Cybersecurity', type: 'B' },
          { name: 'Project Management', type: 'B' },
          { name: 'Psychology', type: 'E' },
        ],
      },
      {
        semesterNumber: 8,
        courses: [
          { name: 'Advanced Programming', type: 'B' },
          { name: 'Cloud Computing', type: 'B' },
          { name: 'DevOps', type: 'B' },
          { name: 'System Architecture', type: 'B' },
          { name: 'Economics', type: 'E' },
        ],
      },
      {
        semesterNumber: 9,
        courses: [
          { name: 'Capstone Project I', type: 'B' },
          { name: 'Advanced Algorithms', type: 'B' },
          { name: 'Research Methods', type: 'B' },
          { name: 'Professional Practice', type: 'B' },
          { name: 'Leadership', type: 'E' },
        ],
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(9, { message: 'Pensum must have at least 9 semesters' })
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters: SemesterDto[];
}
