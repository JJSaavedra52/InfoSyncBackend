import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensumController } from './pensum.controller';
import { APP_PIPE } from '@nestjs/core';
import { PensumService } from './pensum.service';
import { MongoModule } from 'src/database/mongo.module';
import { Pensum } from './entity/pensum.entity';

@Module({
  imports: [
    MongoModule,
    TypeOrmModule.forFeature([Pensum]), // This is crucial for MongoDB entities
  ],
  controllers: [PensumController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    PensumService,
  ],
})
export class PensumModule {}
