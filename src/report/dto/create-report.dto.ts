import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'post', enum: ['post', 'comment', 'subcomment'] })
  @IsEnum(['post', 'comment', 'subcomment'])
  targetType: 'post' | 'comment' | 'subcomment';

  @ApiProperty({ example: '68bb708f9fe1a22e69dc451b' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({
    example: 'Inappropriate',
    enum: [
      'Inappropriate',
      'Harassment',
      'Offensive',
      'Spam',
      'Misleading',
      'Copyright',
      'Impersonation',
      'Privacy',
    ],
  })
  @IsEnum(
    [
      'Inappropriate',
      'Harassment',
      'Offensive',
      'Spam',
      'Misleading',
      'Copyright',
      'Impersonation',
      'Privacy',
    ],
    {
      message:
        'reason must be one of the following values: Inappropriate, Harassment, Offensive, Spam, Misleading, Copyright, Impersonation, Privacy',
    },
  )
  reason:
    | 'Inappropriate'
    | 'Harassment'
    | 'Offensive'
    | 'Spam'
    | 'Misleading'
    | 'Copyright'
    | 'Impersonation'
    | 'Privacy';

  @ApiProperty({ example: 'This post is inappropriate.' })
  reviewDescription?: string; // reporter-provided text
}
