import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PensumModule } from './pensum/pensum.module';
import { PostModule } from './post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { ImageController } from './image.controller';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PensumModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController, ImageController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
