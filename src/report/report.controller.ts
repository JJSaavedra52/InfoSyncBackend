import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportValidationService } from './validators/report-validation.service';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly reportValidationService: ReportValidationService,
  ) {}

  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    await this.reportValidationService.validateTargetExists(
      createReportDto.targetType,
      createReportDto.targetId,
    );
    return this.reportService.create(createReportDto);
  }

  @Get()
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
