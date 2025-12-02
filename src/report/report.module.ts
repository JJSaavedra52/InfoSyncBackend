import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entity/report.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportValidationService } from './validators/report-validation.service';
import { User } from '../user/entity/user.entity';
import { Post } from '../post/entity/post.entity';
import { Comment } from '../comment/entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Post, Comment])],
  controllers: [ReportController],
  providers: [ReportService, ReportValidationService],
})
export class ReportModule {}
