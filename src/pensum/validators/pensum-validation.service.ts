/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Pensum } from '../entity/pensum.entity';

@Injectable()
export class PensumValidationService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  async validateUniqueName(name: string): Promise<void> {
    const existingPensum = await this.pensumRepository.findOne({
      where: { name } as any,
    });

    if (existingPensum) {
      throw new BadRequestException('Pensum name already exists');
    }
  }

  validateMinimumSemesters(semesters: any[]): void {
    if (!semesters || semesters.length < 9) {
      throw new BadRequestException('Pensum must have at least 9 semesters');
    }
  }

  validateMinimumCoursesPerSemester(semesters: any[]): void {
    if (!semesters) {
      throw new BadRequestException(
        'Semesters are required and must contain courses',
      );
    }

    // EVERY semester must have at least 5 courses - NO EXCEPTIONS
    const invalidSemesters = semesters.filter(
      (semester) => !semester.courses || semester.courses.length < 5,
    );

    if (invalidSemesters.length > 0) {
      const semesterNumbers = invalidSemesters
        .map((s) => s.semesterNumber)
        .join(', ');
      throw new BadRequestException(
        `All semesters must have at least 5 courses. Invalid semesters: ${semesterNumbers}`,
      );
    }
  }

  validateUniqueCoursesAcrossSemesters(semesters: any[]): void {
    if (!semesters) return;

    const allCourseNames: string[] = [];
    const duplicates: string[] = [];

    for (const semester of semesters) {
      if (semester.courses) {
        for (const course of semester.courses) {
          if (allCourseNames.includes(course.name)) {
            if (!duplicates.includes(course.name)) {
              duplicates.push(course.name);
            }
          } else {
            allCourseNames.push(course.name);
          }
        }
      }
    }

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate courses found: ${duplicates.join(', ')}`,
      );
    }
  }

  // Method to validate all creation rules at once
  async validatePensumCreation(createPensumDto: any): Promise<void> {
    await this.validateUniqueName(createPensumDto.name);
    this.validateMinimumSemesters(createPensumDto.semesters);
    this.validateMinimumCoursesPerSemester(createPensumDto.semesters); // This will now fail if no semesters or empty semesters
    this.validateUniqueCoursesAcrossSemesters(createPensumDto.semesters);
  }
}
