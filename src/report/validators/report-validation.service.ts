/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Post } from '../../post/entity/post.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ReportValidationService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
    @InjectRepository(Comment)
    private commentRepository: MongoRepository<Comment>,
  ) {}

  async validateTargetExists(
    targetType: string,
    targetId: string,
  ): Promise<void> {
    if (!ObjectId.isValid(targetId)) {
      throw new BadRequestException('Invalid targetId format');
    }
    let exists = false;
    if (targetType === 'post') {
      exists = !!(await this.postRepository.findOne({
        where: { _id: new ObjectId(targetId) } as any,
      }));
    } else if (targetType === 'comment') {
      exists = !!(await this.commentRepository.findOne({
        where: { _id: new ObjectId(targetId) } as any,
      }));
    } else if (targetType === 'subcomment') {
      // Search all comments for a subcomment with this _id
      const comments = await this.commentRepository.find();
      exists = comments.some(
        (comment) =>
          Array.isArray(comment.subComments) &&
          comment.subComments.some((sc) => sc._id?.toString() === targetId),
      );
    }
    if (!exists) {
      throw new BadRequestException('Target to report does not exist');
    }
  }
}
