import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: '68bb708f9fe1a22e69dc451b',
    description: 'ID of the post being commented on',
  })
  @IsNotEmpty()
  @IsString()
  postId: string;

  @ApiProperty({ example: 'This is a comment.' })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, { message: 'Commentary must not be empty or only spaces' })
  commentary: string;
}
