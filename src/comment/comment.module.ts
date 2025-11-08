import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entity/comment.entity';
import { CommentValidationService } from './validators/comment-validation.service';
import { Post } from '../post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User]), SocketModule],
  controllers: [CommentController],
  providers: [CommentService, CommentValidationService],
  exports: [],
})
export class CommentModule {}
