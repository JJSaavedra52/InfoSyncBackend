/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Pensum } from '../../pensum/entity/pensum.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostValidationService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  async validatePensumExists(pensumId: string): Promise<Pensum> {
    const pensum = await this.pensumRepository.findOne({
      where: { _id: new ObjectId(pensumId) } as any,
    });
    if (!pensum) {
      throw new BadRequestException('The specified pensum does not exist.');
    }
    return pensum;
  }

  validateCourseInPensum(pensum: Pensum, courseName: string): void {
    const courseExists = pensum.semesters
      .flatMap((semester: any) => semester.courses)
      .some((course: any) => course.name === courseName);

    if (!courseExists) {
      throw new BadRequestException(
        'The specified course does not exist in the selected pensum.',
      );
    }
  }

  // Combined validation for creation
  async validatePostCreation(
    pensumId: string,
    courseName: string,
  ): Promise<void> {
    const pensum = await this.validatePensumExists(pensumId);
    this.validateCourseInPensum(pensum, courseName);
  }
}
