import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { PostValidationService } from './validators/post-validation.service';
import { Pensum } from '../pensum/entity/pensum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Pensum])],
  controllers: [PostController],
  providers: [PostService, PostValidationService],
})
export class PostModule {}
