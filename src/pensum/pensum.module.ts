import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensumController } from './pensum.controller';
import { PensumService } from './pensum.service';
import { Pensum } from './entity/pensum.entity';
import { PensumValidationService } from './validators/pensum-validation.service';
import { MongoModule } from 'src/database/mongo.module';

@Module({
  imports: [MongoModule, TypeOrmModule.forFeature([Pensum])],
  controllers: [PensumController],
  providers: [PensumService, PensumValidationService],
})
export class PensumModule {}
