import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({
    example: 'Resolved',
    enum: ['Pending', 'Resolved', 'Dismissed'],
    description: 'State of the report after admin review',
  })
  @IsEnum(['Pending', 'Resolved', 'Dismissed'], {
    message: 'state must be Pending, Resolved, or Dismissed',
  })
  state?: 'Pending' | 'Resolved' | 'Dismissed';

  @ApiPropertyOptional({
    example: 'AdminUser',
    description: 'User name of the admin who reviewed the report',
  })
  reviewedBy?: string; // Admin userName (optional)

  @ApiPropertyOptional({
    example: 'Reviewed and resolved. No further action needed.',
    description: 'Admin review notes or resolution description',
  })
  reviewDescription?: string;

  @ApiPropertyOptional({
    example: '2025-09-18T02:00:00.000Z',
    description: 'Timestamp when the report was resolved (set automatically)',
  })
  resolvedAt?: Date;
}
