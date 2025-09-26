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
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubCommentDto } from './dto/create-subcomment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentValidationService } from './validators/comment-validation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentValidationService: CommentValidationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a comment',
    description: 'Requires Authorization header: Bearer [JWT]',
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto) {
    await this.commentValidationService.validatePostExists(
      createCommentDto.postId,
    );
    // Add user existence validation here
    await this.commentValidationService.validateUserExists(
      createCommentDto.userId,
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
  @ApiOperation({
    summary: 'Update a comment',
    description:
      'Only the creator can update. Requires Authorization header: Bearer [JWT]',
  })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    if (!updateCommentDto.userId) {
      throw new BadRequestException('userId is required to update a comment');
    }
    await this.commentValidationService.validateCommentCreator(
      id,
      updateCommentDto.userId,
    );
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a comment',
    description:
      'Only the creator or admin can delete. Requires Authorization header: Bearer [JWT]. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '64f8a1234567890abcdef123' },
      },
      required: ['userId'],
    },
  })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    await this.commentValidationService.validateCommentDelete(id, userId);
    return this.commentService.remove(id);
  }

  @Post(':id/subcomment')
  @ApiOperation({
    summary: 'Add a subcomment',
    description: 'Requires Authorization header: Bearer [JWT]',
  })
  @UseGuards(JwtAuthGuard)
  async addSubComment(
    @Param('id') id: string,
    @Body() subCommentDto: CreateSubCommentDto,
  ) {
    await this.commentValidationService.validateUserExists(
      subCommentDto.userId,
    );
    return this.commentService.addSubComment(id, subCommentDto);
  }

  @Delete(':commentId/subcomment/:subCommentId')
  @ApiOperation({
    summary: 'Delete a subcomment',
    description:
      'Only the creator or admin can delete. Requires Authorization header: Bearer [JWT]. You must send userId in the body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '64f8a1234567890abcdef123' },
      },
      required: ['userId'],
    },
  })
  @UseGuards(JwtAuthGuard)
  async removeSubComment(
    @Param('commentId') commentId: string,
    @Param('subCommentId') subCommentId: string,
    @Body('userId') userId: string,
  ) {
    await this.commentValidationService.validateSubCommentDelete(
      commentId,
      subCommentId,
      userId,
    );
    return this.commentService.removeSubComment(commentId, subCommentId);
  }

  @Get('post/:postId')
  async findByPostId(@Param('postId') postId: string) {
    return this.commentService.findByPostId(postId);
  }
}
