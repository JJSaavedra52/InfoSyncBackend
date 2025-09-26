import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiPropertyOptional({ example: '64f8a1234567890abcdef123' })
  userId?: string;

  @ApiPropertyOptional({ example: 'This is a comment.' })
  commentary?: string;
}
