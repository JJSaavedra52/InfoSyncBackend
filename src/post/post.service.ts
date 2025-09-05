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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: MongoRepository<Post>,
    private postValidationService: PostValidationService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Validate pensum and course
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
    await this.postRepository.update({ _id: new ObjectId(id) } as any, {
      ...updatePostDto,
      updatedAt: new Date(),
    });
    return await this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.postRepository.delete({
      _id: new ObjectId(id),
    } as any);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return { message: `Post with ID ${id} has been deleted` };
  }
}
