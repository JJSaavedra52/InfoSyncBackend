/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Pensum } from '../entity/pensum.entity';
import { User } from '../../user/entity/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PensumValidationService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
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

  // NEW: Validate that totalSemesters matches the actual semesters array length
  validateTotalSemestersConsistency(
    semesters: any[],
    totalSemesters?: number,
  ): void {
    if (totalSemesters && semesters) {
      if (semesters.length !== totalSemesters) {
        throw new BadRequestException(
          `Total semesters (${totalSemesters}) must match the number of semesters provided (${semesters.length})`,
        );
      }
    }
  }

  // NEW: Validate that semester numbers are sequential and correct
  validateSemesterNumbers(semesters: any[]): void {
    if (!semesters) return;

    const semesterNumbers = semesters
      .map((s) => s.semesterNumber)
      .sort((a, b) => a - b);

    // Check for duplicates
    const uniqueNumbers = [...new Set(semesterNumbers)];
    if (uniqueNumbers.length !== semesterNumbers.length) {
      throw new BadRequestException('Duplicate semester numbers found');
    }

    // Check for sequential numbers starting from 1
    for (let i = 0; i < semesterNumbers.length; i++) {
      if (semesterNumbers[i] !== i + 1) {
        throw new BadRequestException(
          `Semester numbers must be sequential starting from 1. Missing or incorrect: ${i + 1}`,
        );
      }
    }
  }

  validateMinimumCoursesPerSemester(semesters: any[]): void {
    if (!semesters) {
      throw new BadRequestException(
        'Semesters are required and must contain courses',
      );
    }

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

  // Updated method with new validations
  async validatePensumCreation(createPensumDto: any): Promise<void> {
    await this.validateUniqueName(createPensumDto.name);
    this.validateMinimumSemesters(createPensumDto.semesters);
    this.validateSemesterNumbers(createPensumDto.semesters); // NEW
    this.validateTotalSemestersConsistency(
      createPensumDto.semesters,
      createPensumDto.totalSemesters,
    );
    this.validateMinimumCoursesPerSemester(createPensumDto.semesters);
    this.validateUniqueCoursesAcrossSemesters(createPensumDto.semesters);
  }

  async validateAdmin(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource');
    }
  }
}
