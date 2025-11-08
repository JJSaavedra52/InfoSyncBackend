/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubCommentDto } from './dto/create-subcomment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ObjectId } from 'mongodb';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: MongoRepository<Comment>,
    private socketGateway: SocketGateway,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      subComments: [], // <-- Always initialize as array
      helpedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.commentRepository.save(newComment);

    // Emit real-time event to clients in the post room (best-effort)
    try {
      const commentForEmit = this._serializeForEmit(saved);
      this.socketGateway.emitCommentAdded(String(saved.postId), commentForEmit);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to emit comment_added:', err?.message ?? err);
    }

    return saved;
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
    const { userId, commentary } = updateCommentDto;
    await this.commentRepository.update({ _id: new ObjectId(id) } as any, {
      userId,
      commentary,
      updatedAt: new Date(),
    });
    const updated = await this.findOne(id);
    try {
      const commentForEmit = this._serializeForEmit(updated);
      this.socketGateway.emitCommentUpdated(String(updated.postId), commentForEmit);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to emit comment_updated:', err?.message ?? err);
    }
    return updated;
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
    subCommentDto: CreateSubCommentDto, // <-- Use the DTO type here
  ) {
    const comment = await this.findOne(commentId);
    if (!Array.isArray(comment.subComments)) comment.subComments = [];
    comment.subComments.push({
      _id: new ObjectId(),
      userId: subCommentDto.userId,
      commentary: subCommentDto.commentary,
      createdAt: new Date(),
    });
    await this.commentRepository.save(comment);
    try {
      const commentForEmit = this._serializeForEmit(comment);
      this.socketGateway.emitCommentUpdated(String(comment.postId), commentForEmit);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to emit comment_updated (subcomment):', err?.message ?? err);
    }
    return comment;
  }

  async removeSubComment(commentId: string, subCommentId: string) {
    const comment = await this.findOne(commentId);
    if (!Array.isArray(comment.subComments)) comment.subComments = [];
    const initialLength = comment.subComments.length;
    comment.subComments = comment.subComments.filter(
      (subComment) => subComment._id.toString() !== subCommentId,
    );
    if (comment.subComments.length === initialLength) {
      throw new NotFoundException(`SubComment ${subCommentId} not found`);
    }
    await this.commentRepository.save(comment);
    try {
      const commentForEmit = this._serializeForEmit(comment);
      this.socketGateway.emitCommentUpdated(String(comment.postId), commentForEmit);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to emit comment_updated (removeSubComment):', err?.message ?? err);
    }
    return comment;
  }

  async findByPostId(postId: string) {
    return await this.commentRepository.find({
      where: { postId },
    });
  }

  /**
   * Prepare a comment object for socket emission by converting ObjectId fields to strings.
   */
  private _serializeForEmit(comment: Comment) {
    const c: any = { ...comment } as any;
    try {
      if (c._id && typeof c._id.toString === 'function') c._id = c._id.toString();
      if (Array.isArray(c.subComments)) {
        c.subComments = c.subComments.map((sc: any) => ({
          ...sc,
          _id: sc._id && typeof sc._id.toString === 'function' ? sc._id.toString() : sc._id,
        }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('serializeForEmit: failed to fully normalize comment ids', err?.message ?? err);
    }
    return c;
  }
}
