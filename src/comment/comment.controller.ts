/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentValidationService } from './validators/comment-validation.service';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentValidationService: CommentValidationService,
  ) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    await this.commentValidationService.validatePostExists(
      createCommentDto.postId,
    );
    return this.commentService.create(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }

  @Post(':id/subcomment')
  async addSubComment(
    @Param('id') id: string,
    @Body() subCommentDto: { userId: string; commentary: string },
  ) {
    return this.commentService.addSubComment(id, subCommentDto);
  }
}
