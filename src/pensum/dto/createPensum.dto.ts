import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreatePensumDto {
  @IsString()
  @Length(2, 10)
  @IsNotEmpty()
  name: string;
}
