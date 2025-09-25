/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Report } from './entity/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: MongoRepository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto) {
    const newReport = this.reportRepository.create({
      ...createReportDto,
      state: 'Pending', // Default state
      createdAt: new Date(),
    });
    return await this.reportRepository.save(newReport);
  }

  async findAll() {
    return await this.reportRepository.find();
  }

  async findOne(id: string) {
    return await this.reportRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const updateData = { ...updateReportDto };
    const state = updateReportDto.state?.toLowerCase();

    if (state === 'resolved' || state === 'dismissed') {
      updateData.resolvedAt = new Date();
    }

    await this.reportRepository.update(
      { _id: new ObjectId(id) } as any,
      updateData,
    );
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.reportRepository.delete({ _id: new ObjectId(id) } as any);
    return { message: `Report ${id} deleted` };
  }
}
