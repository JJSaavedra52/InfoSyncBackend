import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensumController } from './pensum.controller';
import { PensumService } from './pensum.service';
import { MongoModule } from 'src/database/mongo.module';
import { Pensum } from './entity/pensum.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  IsUniquePensumNameConstraint,
  HasMinimumCoursesPerSemesterConstraint,
  HasUniqueCoursesAcrossSemestersConstraint,
} from './validators/pensum.validators';

@Module({
  imports: [MongoModule, TypeOrmModule.forFeature([Pensum])],
  controllers: [PensumController],
  providers: [
    PensumService,
    {
      provide: IsUniquePensumNameConstraint,
      useFactory: (pensumRepository) => {
        console.log('Creating IsUniquePensumNameConstraint with repository'); // Debug log
        return new IsUniquePensumNameConstraint(pensumRepository);
      },
      inject: [getRepositoryToken(Pensum)],
    },
    HasMinimumCoursesPerSemesterConstraint,
    HasUniqueCoursesAcrossSemestersConstraint,
  ],
})
export class PensumModule {}
