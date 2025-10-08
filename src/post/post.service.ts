/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entity/post.entity';
import { PostValidationService } from './validators/post-validation.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
    private postValidationService: PostValidationService,
    private socketGateway: SocketGateway,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    await this.postValidationService.validateUserExists(createPostDto.userId);
    await this.postValidationService.validatePostCreation(
      createPostDto.pensumId,
      createPostDto.course,
    );
    const newPost = this.postRepository.create({
      ...createPostDto,
      images: createPostDto.images || [],
      files: createPostDto.files || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.postRepository.save(newPost);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    if (!updatePostDto.userId) {
      throw new NotFoundException('userId is required to update a post');
    }

    await this.postValidationService.validateUserCanModifyPost(
      post,
      updatePostDto.userId,
    );
    await this.postRepository.update({ _id: new ObjectId(id) } as any, {
      ...updatePostDto,
      updatedAt: new Date(),
    });
    return await this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.findOne(id);
    await this.postValidationService.validateUserCanDeletePost(post, userId);
    const result = await this.postRepository.delete({
      _id: new ObjectId(id),
    } as any);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return { message: `Post with ID ${id} has been deleted` };
  }

  async likePost(postId: string) {
    await this.postRepository.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likeCount: 1 } },
    );
    const post = await this.postRepository.findOne({
      where: { _id: new ObjectId(postId) } as any,
    });
    this.socketGateway.server.emit('likeCountUpdate', {
      postId,
      likeCount: post.likeCount,
    });
  }

  async dislikePost(postId: string) {
    await this.postRepository.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { dislikeCount: 1 } },
    );
  }
}
