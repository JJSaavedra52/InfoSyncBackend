import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSubCommentDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  userId: string;

  @ApiProperty({ example: 'This is a subcomment.' })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, { message: 'Commentary must not be empty or only spaces' })
  commentary: string;
}
