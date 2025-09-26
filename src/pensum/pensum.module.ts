import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensumController } from './pensum.controller';
import { PensumService } from './pensum.service';
import { Pensum } from './entity/pensum.entity';
import { PensumValidationService } from './validators/pensum-validation.service';
import { MongoModule } from 'src/database/mongo.module';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [MongoModule, TypeOrmModule.forFeature([Pensum, User])],
  controllers: [PensumController],
  providers: [PensumService, PensumValidationService],
})
export class PensumModule {}
