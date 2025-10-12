/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CloudinaryService } from '../cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a post',
    description: 'Requires header: Authorization = Bearer your_jwt_token',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'files', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; files?: Express.Multer.File[] },
  ) {
    const imageUrls: string[] = [];
    for (const file of files.images || []) {
      const uploadResult = await this.cloudinaryService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      imageUrls.push(uploadResult.secure_url);
    }

    const fileUrls: string[] = [];
    for (const file of files.files || []) {
      const uploadResult = await this.cloudinaryService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      fileUrls.push(uploadResult.secure_url);
    }

    createPostDto.images = imageUrls;
    createPostDto.files = fileUrls;

    return this.postService.create(createPostDto);
  }

  // (R) Get all post
  @Get()
  @HttpCode(200)
  findAll() {
    return this.postService.findAll();
  }

  // (R) Get a specific post
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a post',
    description: 'Requires header: Authorization = Bearer your_jwt_token',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'files', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; files?: Express.Multer.File[] },
  ) {
    const imageUrls: string[] = [];
    for (const file of files.images || []) {
      const uploadResult = await this.cloudinaryService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      imageUrls.push(uploadResult.secure_url);
    }

    const fileUrls: string[] = [];
    for (const file of files.files || []) {
      const uploadResult = await this.cloudinaryService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      fileUrls.push(uploadResult.secure_url);
    }

    if (imageUrls.length) updatePostDto.images = imageUrls;
    if (fileUrls.length) updatePostDto.files = fileUrls;

    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Requires header: Authorization = Bearer your_jwt_token. You must send userId in the body.',
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
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postService.remove(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Param('id') id: string) {
    await this.postService.likePost(id);
    return { message: 'Post liked' };
  }

  @Post(':id/dislike')
  @UseGuards(JwtAuthGuard)
  async dislikePost(@Param('id') id: string) {
    await this.postService.dislikePost(id);
    return { message: 'Post disliked' };
  }

  @Patch(':id/like')
  @UseGuards(JwtAuthGuard)
  async unlikePost(@Param('id') id: string) {
    await this.postService.unlikePost(id);
    return { message: 'Post unliked' };
  }

  @Patch(':id/dislike')
  @UseGuards(JwtAuthGuard)
  async undislikePost(@Param('id') id: string) {
    await this.postService.undislikePost(id);
    return { message: 'Post undisliked' };
  }
}
