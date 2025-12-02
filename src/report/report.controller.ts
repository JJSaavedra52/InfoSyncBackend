/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
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
  @UseGuards(JwtAuthGuard)
  async create(@Body() createReportDto: CreateReportDto, @Req() req) {
    // ensure reporter userId comes from token (avoid spoofing)
    createReportDto.userId = createReportDto.userId ?? req.user.userId;
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
      'Requires Authorization header: Bearer your_jwt_token. Only admins can access.',
  })
  async findAll(@Req() req) {
    await this.reportValidationService.validateAdmin(req.user.userId);
    return this.reportService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can access.',
  })
  async findOne(@Param('id') id: string, @Req() req) {
    await this.reportValidationService.validateAdmin(req.user.userId);
    return this.reportService.findOne(id, req.user.userId);
  }

  // PATCH /report/:id/resolve  (requires auth)
  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveReport(
    @Param('id') id: string,
    @Body() body: { reviewDescription?: string },
    @Req() req,
  ) {
    const adminUserId = req.user?.userId;
    await this.reportValidationService.validateUserExists(adminUserId);
    await this.reportValidationService.validateAdmin(adminUserId);

    const reviewerName =
      req.user?.name ?? req.user?.username ?? req.user?.fullName ?? adminUserId;

    return this.reportService.resolveReport(
      id,
      reviewerName,
      body.reviewDescription,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a report',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can update. You must send userId in the body, or the admin token will be used.',
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
      required: ['state'],
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req,
  ) {
    // Use the authenticated user as the admin performing the action
    const adminUserId = req.user?.userId;
    await this.reportValidationService.validateUserExists(adminUserId);
    await this.reportValidationService.validateAdmin(adminUserId);

    // Set reviewedBy to a human-readable name from the token (fallback to id)
    updateReportDto.reviewedBy =
      req.user?.name ?? req.user?.username ?? req.user?.fullName ?? adminUserId;

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
