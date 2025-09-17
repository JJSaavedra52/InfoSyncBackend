import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  userId: string;

  @ApiProperty({
    example: '68bb708f9fe1a22e69dc451b',
    description: 'ID of the post being commented on',
  })
  postId: string;

  @ApiProperty({ example: 'This is a comment.' })
  commentary: string;
}
