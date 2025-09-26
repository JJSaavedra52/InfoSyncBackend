import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from './entity/report.entity';
import { ReportValidationService } from './validators/report-validation.service';
import { Post } from '../post/entity/post.entity';
import { Comment } from '../comment/entity/comment.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Post, Comment, User])],
  controllers: [ReportController],
  providers: [ReportService, ReportValidationService],
})
export class ReportModule {}
