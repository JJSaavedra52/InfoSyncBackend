/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Post } from '../../post/entity/post.entity';
import { User } from '../../user/entity/user.entity';
import { Comment } from '../entity/comment.entity'; // Adjust path if needed
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentValidationService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    @InjectRepository(Comment)
    private commentRepository: MongoRepository<Comment>, // <-- Add this line
  ) {}

  async validatePostExists(postId: string): Promise<void> {
    if (!ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId format');
    }
    const post = await this.postRepository.findOne({
      where: { _id: new ObjectId(postId) } as any,
    });
    if (!post) {
      throw new BadRequestException('Referenced post does not exist');
    }
  }

  async validateUserExists(userId: string): Promise<User> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId format');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user;
  }

  async validateCommentCreator(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { _id: new ObjectId(commentId) } as any,
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new BadRequestException('Only the creator can update this comment');
  }

  async validateCommentDelete(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { _id: new ObjectId(commentId) } as any,
    });
    if (!comment) throw new NotFoundException('Comment not found');
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    if (comment.userId !== userId && user.role !== 'admin') {
      throw new BadRequestException(
        'Only the creator or admin can delete this comment',
      );
    }
  }
}
