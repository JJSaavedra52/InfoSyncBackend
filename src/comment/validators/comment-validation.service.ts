/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Post } from '../../post/entity/post.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentValidationService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
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
}
