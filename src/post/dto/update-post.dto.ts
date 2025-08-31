import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    description: 'Updated title of the post',
    example: 'How do I solve this integral? (updated)',
    minLength: 5,
    maxLength: 100,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description/content of the post',
    example: 'I found a partial solution, but I need more help.',
    minLength: 10,
    maxLength: 1000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated subject (single word)',
    example: 'Calculus',
  })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Updated course',
    example: 'Calculus I',
  })
  course?: string;

  @ApiPropertyOptional({
    description: 'Updated array of image URLs',
    type: [String],
    example: [
      'https://bucket.example.com/image1.png',
      'https://bucket.example.com/image3.jpg',
    ],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Updated array of file URLs',
    type: [String],
    example: ['https://bucket.example.com/file2.pdf'],
  })
  files?: string[];
}
