import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  //IsOptional(),
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class AddCourseDto {
  @IsNumber()
  @Min(1)
  @Max(9)
  semesterNumber: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  courseName: string;

  @IsEnum(['B', 'E'])
  courseType: 'B' | 'E';

  /*@IsOptional()
  @IsNumber()
  credits?: number;

  @IsOptional()
  @IsString()
  code?: string;*/
}
