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

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsEnum(['B', 'E'])
  type: 'B' | 'E';
}

export class SemesterDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  semesterNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseDto)
  courses: CourseDto[];
}

export class CreatePensumDto {
  @IsString()
  @Length(2, 50)
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(9)
  @Max(12)
  totalSemesters?: number;

  @IsArray()
  @ArrayMinSize(9, { message: 'Pensum must have at least 9 semesters' })
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters: SemesterDto[];
}
