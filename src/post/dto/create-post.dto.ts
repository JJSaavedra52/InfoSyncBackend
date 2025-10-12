import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreatePostDto {
  // Example
  @ApiProperty({
    description: 'User ID of the post creator',
    example: '64f8a1234567890abcdef123',
  })
  // End Example
  @IsString()
  @IsNotEmpty()
  userId: string;

  // Example
  @ApiProperty({
    description: 'Type of post: Q = Question, S = Suggestion',
    enum: ['Q', 'S'],
    example: 'Q',
  })
  // End Example
  @IsEnum(['Q', 'S'])
  type: 'Q' | 'S';

  // Example
  @ApiProperty({
    description: 'Title of the post',
    example: 'How do I solve this integral?',
    minLength: 3,
    maxLength: 100,
  })
  // End Example
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  title: string;

  @ApiProperty({
    description: 'Subject of the post (single word, no spaces)',
    example: 'Calculus',
  })
  // End Example
  @IsString()
  @IsNotEmpty()
  @Matches(/^\w+$/, {
    message: 'Subject must be a single word (no spaces or special characters)',
  })
  subject: string;

  @ApiProperty({
    description: 'Description or content of the post',
    example: 'I am stuck on this math problem. Can anyone help?',
    minLength: 5,
    maxLength: 1000,
  })
  // End Example
  @IsString()
  @IsNotEmpty()
  @Length(5, 1000)
  description: string;

  @ApiProperty({
    description: 'Pensum ID related to the post',
    example: '64f8a1234567890abcdef123',
  })
  @IsString()
  @IsNotEmpty()
  pensumId: string;

  // Example
  @ApiProperty({
    description: 'Course related to the post',
    example: 'Calculus I',
  })
  // End Example
  @IsString()
  @IsNotEmpty()
  course: string;

  // Example
  @ApiPropertyOptional({
    description: 'Array of image URLs (Cloudinary or other storage)',
    type: [String],
    example: ['https://bucket.com/image1.png', 'https://bucket.com/image2.jpg'],
  })
  // End Example
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // Example
  @ApiPropertyOptional({
    description: 'Array of file URLs (Cloudinary or other storage)',
    type: [String],
    example: ['https://bucket.com/file1.pdf'],
  })
  // End Example
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @ApiPropertyOptional({ example: 0, description: 'Number of comments' })
  commentCount?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of likes' })
  likeCount?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of dislikes' })
  dislikeCount?: number;
}
