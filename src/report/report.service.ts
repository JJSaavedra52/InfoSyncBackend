/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Report } from './entity/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ObjectId } from 'mongodb';
import { ReportValidationService } from './validators/report-validation.service'; // Import your validation service

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: MongoRepository<Report>,
    private reportValidationService: ReportValidationService, // Inject validation service
  ) {}

  async create(createReportDto: CreateReportDto) {
    await this.reportValidationService.validateUserExists(
      createReportDto.userId,
    );

    const newReport = this.reportRepository.create({
      ...createReportDto,
      state: 'Pending', // Default state
      createdAt: new Date(),
    });
    return await this.reportRepository.save(newReport);
  }

  async findAll(userId: string) {
    await this.reportValidationService.validateUserExists(userId);
    await this.reportValidationService.validateAdmin(userId);
    return await this.reportRepository.find();
  }

  async findOne(id: string, userId: string) {
    await this.reportValidationService.validateUserExists(userId);
    await this.reportValidationService.validateAdmin(userId);
    return await this.reportRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    if (!updateReportDto.userId) {
      throw new BadRequestException('userId (admin) is required to update a report');
    }
    const admin = await this.reportValidationService.getAdminUser(updateReportDto.userId);

    const updateData = { ...updateReportDto, reviewedBy: admin.userName };
    const state = updateReportDto.state?.toLowerCase();

    if (state === 'resolved' || state === 'dismissed') {
      updateData.resolvedAt = new Date();
    }

    await this.reportRepository.update(
      { _id: new ObjectId(id) } as any,
      updateData,
    );

    return await this.findOne(id, updateReportDto.userId);
  }

  async remove(id: string, userId: string) {
    await this.reportValidationService.validateUserExists(userId);
    await this.reportValidationService.validateAdmin(userId);

    await this.reportRepository.delete({ _id: new ObjectId(id) } as any);
    return { message: `Report ${id} deleted` };
  }
}
