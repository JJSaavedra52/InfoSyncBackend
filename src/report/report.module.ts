import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from './entities/report.entity';
import { ReportValidationService } from './validators/report-validation.service';
import { Post } from '../post/entity/post.entity';
import { Comment } from '../comment/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Post, Comment])],
  controllers: [ReportController],
  providers: [ReportService, ReportValidationService],
})
export class ReportModule {}
