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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CloudinaryService } from '../cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { diskStorage } from 'multer';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'files', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // or any temp folder
          filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
          },
        }),
      },
    ),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; files?: Express.Multer.File[] },
  ) {
    // Log the files to debug
    console.log('Received images:', files.images);
    console.log('Received files:', files.files);

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    for (const file of files.images || []) {
      const uploadResult = await this.cloudinaryService.uploadImage(file.path);
      imageUrls.push(uploadResult.secure_url);
    }

    // Upload files to Cloudinary
    const fileUrls: string[] = [];
    for (const file of files.files || []) {
      const uploadResult = await this.cloudinaryService.uploadImage(file.path);
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
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
