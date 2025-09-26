import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePensumDto, SemesterDto } from './createPensum.dto';
import {
  IsString,
  Length,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePensumDto extends PartialType(CreatePensumDto) {
  @ApiPropertyOptional({
    description: 'User ID of the admin updating the pensum',
    example: '64f8a1234567890abcdef123',
  })
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Updated name of the pensum',
    example: 'Updated Computer Science Program 2024',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated total number of semesters',
    example: 9,
    minimum: 9,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(9)
  @Max(12)
  totalSemesters?: number;

  @ApiPropertyOptional({
    description:
      'Updated semesters array (can be partial - update only specific semesters)',
    type: [SemesterDto],
    example: [
      {
        semesterNumber: 1,
        courses: [
          { name: 'Math I Updated', type: 'B' },
          { name: 'Physics I', type: 'B' },
          { name: 'Chemistry I', type: 'B' },
          { name: 'Programming I', type: 'B' },
          { name: 'English I', type: 'E' },
        ],
      },
      {
        semesterNumber: 2,
        courses: [
          { name: 'Math II', type: 'B' },
          { name: 'Physics II', type: 'B' },
          { name: 'Chemistry II', type: 'B' },
          { name: 'Programming II', type: 'B' },
          { name: 'English II', type: 'E' },
        ],
      },
      {
        semesterNumber: 3,
        courses: [
          { name: 'Math III', type: 'B' },
          { name: 'Physics III', type: 'B' },
          { name: 'Chemistry III', type: 'B' },
          { name: 'Programming III', type: 'B' },
          { name: 'English III', type: 'E' },
        ],
      },
      {
        semesterNumber: 4,
        courses: [
          { name: 'Math IV', type: 'B' },
          { name: 'Physics IV', type: 'B' },
          { name: 'Chemistry IV', type: 'B' },
          { name: 'Programming IV', type: 'B' },
          { name: 'English IV', type: 'E' },
        ],
      },
      {
        semesterNumber: 5,
        courses: [
          { name: 'Math V', type: 'B' },
          { name: 'Physics V', type: 'B' },
          { name: 'Chemistry V', type: 'B' },
          { name: 'Programming V', type: 'B' },
          { name: 'English V', type: 'E' },
        ],
      },
      {
        semesterNumber: 6,
        courses: [
          { name: 'Math VI', type: 'B' },
          { name: 'Physics VI', type: 'B' },
          { name: 'Chemistry VI', type: 'B' },
          { name: 'Programming VI', type: 'B' },
          { name: 'English VI', type: 'E' },
        ],
      },
      {
        semesterNumber: 7,
        courses: [
          { name: 'Math VII', type: 'B' },
          { name: 'Physics VII', type: 'B' },
          { name: 'Chemistry VII', type: 'B' },
          { name: 'Programming VII', type: 'B' },
          { name: 'English VII', type: 'E' },
        ],
      },
      {
        semesterNumber: 8,
        courses: [
          { name: 'Math VIII', type: 'B' },
          { name: 'Physics VIII', type: 'B' },
          { name: 'Chemistry VIII', type: 'B' },
          { name: 'Programming VIII', type: 'B' },
          { name: 'English VIII', type: 'E' },
        ],
      },
      {
        semesterNumber: 9,
        courses: [
          { name: 'Math IX', type: 'B' },
          { name: 'Physics IX', type: 'B' },
          { name: 'Chemistry IX', type: 'B' },
          { name: 'Programming IX', type: 'B' },
          { name: 'English IX', type: 'E' },
        ],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters?: SemesterDto[];
}
