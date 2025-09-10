import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostValidationService } from './validators/post-validation.service';
import { Post } from './entity/post.entity';
import { Pensum } from '../pensum/entity/pensum.entity';
import { CloudinaryService } from '../cloudinary.service'; // <-- Import it

@Module({
  imports: [TypeOrmModule.forFeature([Post, Pensum])],
  controllers: [PostController],
  providers: [PostService, PostValidationService, CloudinaryService], // <-- Add here
})
export class PostModule {}
