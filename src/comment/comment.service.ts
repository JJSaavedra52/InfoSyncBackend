/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: MongoRepository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      subComments: [], // <-- Always initialize as array
      helpedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.commentRepository.save(newComment);
  }

  async findAll() {
    return await this.commentRepository.find();
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);
    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    await this.commentRepository.update({ _id: new ObjectId(id) } as any, {
      ...updateCommentDto,
      updatedAt: new Date(),
    });
    return await this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.commentRepository.delete({
      _id: new ObjectId(id),
    } as any);
    if (result.affected === 0)
      throw new NotFoundException(`Comment ${id} not found`);
    return { message: `Comment ${id} deleted` };
  }

  async addSubComment(
    commentId: string,
    subCommentDto: { userId: string; commentary: string },
  ) {
    const comment = await this.findOne(commentId);
    if (!Array.isArray(comment.subComments)) comment.subComments = [];
    comment.subComments.push({
      ...subCommentDto,
      createdAt: new Date(),
    });
    await this.commentRepository.save(comment);
    return comment;
  }
}
