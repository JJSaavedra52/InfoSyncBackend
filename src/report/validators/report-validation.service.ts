/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Post } from '../../post/entity/post.entity';
import { Comment } from '../../comment/entity/comment.entity';
import { ObjectId } from 'mongodb';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class ReportValidationService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
    @InjectRepository(Comment)
    private commentRepository: MongoRepository<Comment>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
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

  async validateAdmin(userId: string) {
    if (!userId || !ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid or missing userId format');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource');
    }
  }

  async validateAdminByUserName(userName: string) {
    if (!userName) {
      throw new BadRequestException('Missing admin userName');
    }
    const user = await this.userRepository.findOne({
      where: { userName },
    });
    if (!user) throw new NotFoundException('Admin user not found');
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource');
    }
    return user; // Return the user object
  }

  async validateUserExists(userId: string) {
    if (!userId || !ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid or missing userId format');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
  }

  async getAdminUser(userId: string) {
    if (!userId || !ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid or missing userId format');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource');
    }
    return user;
  }
}
