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
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsEnum(['B', 'E'])
  type: 'B' | 'E';

  // @IsOptional()
  // @IsNumber()
  // credits?: number;

  // @IsOptional()
  // @IsString()
  // code?: string;
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
  @Min(1)
  @Max(12)
  totalSemesters?: number;

  // @IsOptional()
  // @IsNumber()
  // totalCredits?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters?: SemesterDto[];
}
