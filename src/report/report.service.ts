/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
      createdAt: new Date(),
      status: 'open',
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
    const q = { _id: new ObjectId(id) } as any;
    const existing = await this.reportRepository.findOne({ where: q });
    if (!existing) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Build the $set payload: write to 'state' (not 'status'), preserve other fields
    const setPayload: any = {
      updatedAt: new Date(),
    };

    if (typeof updateReportDto.state !== 'undefined') {
      setPayload.state = updateReportDto.state;
      // when resolving/setting a state that indicates resolution, stamp reviewer/time
      if (String(updateReportDto.state).toLowerCase() === 'resolved') {
        setPayload.reviewedAt = new Date();
      }
    }

    if (typeof updateReportDto.reviewDescription !== 'undefined') {
      setPayload.reviewDescription = updateReportDto.reviewDescription;
    }

    if (typeof updateReportDto.reviewedBy !== 'undefined') {
      setPayload.reviewedBy = updateReportDto.reviewedBy;
    }

    await this.reportRepository.updateOne(q, { $set: setPayload });

    return this.reportRepository.findOne({ where: q });
  }

  async remove(id: string, userId: string) {
    await this.reportValidationService.validateUserExists(userId);
    await this.reportValidationService.validateAdmin(userId);

    await this.reportRepository.delete({ _id: new ObjectId(id) } as any);
    return { message: `Report ${id} deleted` };
  }

  async resolveReport(
    reportId: string,
    reviewerName: string,
    reviewDescription?: string,
  ) {
    const q = { _id: new ObjectId(reportId) } as any;
    const existing = await this.reportRepository.findOne({ where: q });
    if (!existing) throw new NotFoundException('Report not found');

    await this.reportRepository.updateOne(q, {
      $set: {
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
        // allow admin to add/replace reviewDescription; if none provided keep existing
        reviewDescription: reviewDescription ?? existing.reviewDescription,
        status: 'resolved',
      },
    });

    return this.reportRepository.findOne({ where: q });
  }
}
