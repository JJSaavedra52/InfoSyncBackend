import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportValidationService } from './validators/report-validation.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly reportValidationService: ReportValidationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Both students and admins can create reports.',
  })
  async create(@Body() createReportDto: CreateReportDto) {
    await this.reportValidationService.validateTargetExists(
      createReportDto.targetType,
      createReportDto.targetId,
    );
    return this.reportService.create(createReportDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reports',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can access. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'adminUserId123' },
      },
      required: ['userId'],
    },
  })
  async findAll(@Body('userId') userId: string) {
    return this.reportService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can access. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'adminUserId123' },
      },
      required: ['userId'],
    },
  })
  async findOne(@Param('id') id: string, @Body('userId') userId: string) {
    return this.reportService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can update. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '68d5a53750fc02a273a93e20' },
        state: { type: 'string', example: 'Resolved' },
        reviewDescription: {
          type: 'string',
          example: 'Reviewed and resolved.',
        },
      },
      required: ['userId', 'state'],
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    if (!updateReportDto.userId) {
      throw new BadRequestException(
        'userId (admin) is required to update a report',
      );
    }
    await this.reportValidationService.validateAdmin(updateReportDto.userId);
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can delete. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'adminUserId123' },
      },
      required: ['userId'],
    },
  })
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.reportService.remove(id, userId);
  }
}
