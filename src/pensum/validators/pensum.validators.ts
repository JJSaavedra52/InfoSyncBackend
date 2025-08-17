import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Pensum } from '../entity/pensum.entity';

// 1. Unique Pensum Name Validator
@ValidatorConstraint({ name: 'isUniquePensumName', async: true })
@Injectable()
export class IsUniquePensumNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private pensumRepository: MongoRepository<Pensum>) {
    console.log('IsUniquePensumNameConstraint constructor called'); // Debug log
  }

  async validate(name: string): Promise<boolean> {
    console.log('Validating unique name for:', name); // Debug log
    console.log('Repository available:', !!this.pensumRepository); // Debug log

    if (!this.pensumRepository) {
      console.log('Repository not available, skipping validation'); // Debug log
      return true;
    }

    try {
      const existingPensum = await this.pensumRepository.findOne({
        where: { name } as any,
      });

      console.log('Found existing pensum:', existingPensum); // Debug log
      console.log('Validation result:', !existingPensum); // Debug log

      return !existingPensum;
    } catch (error) {
      console.error('Error in unique name validation:', error); // Debug log
      return true; // Allow creation if there's an error
    }
  }

  defaultMessage(): string {
    return 'Pensum name already exists';
  }
}

// 2. Minimum Courses Per Semester Validator - STRICT VERSION
@ValidatorConstraint({ name: 'hasMinimumCoursesPerSemester' })
export class HasMinimumCoursesPerSemesterConstraint
  implements ValidatorConstraintInterface
{
  validate(semesters: any[]): boolean {
    if (!semesters || semesters.length === 0) return true; // Skip if no semesters provided in creation

    // EVERY semester must have at least 5 courses - NO EXCEPTIONS
    for (const semester of semesters) {
      if (!semester.courses || semester.courses.length < 5) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const semesters = args.value as any[];
    if (semesters) {
      const invalidSemesters = semesters
        .filter((s) => !s.courses || s.courses.length < 5)
        .map((s) => s.semesterNumber)
        .join(', ');

      return `All semesters must have at least 5 courses. Invalid semesters: ${invalidSemesters}`;
    }
    return 'Each semester must have at least 5 courses';
  }
}

// 3. Unique Courses Across Semesters Validator
@ValidatorConstraint({ name: 'hasUniqueCoursesAcrossSemesters' })
export class HasUniqueCoursesAcrossSemestersConstraint
  implements ValidatorConstraintInterface
{
  validate(semesters: any[]): boolean {
    if (!semesters) return true;

    const allCourseNames: string[] = [];

    for (const semester of semesters) {
      if (semester.courses) {
        for (const course of semester.courses) {
          if (allCourseNames.includes(course.name)) {
            return false;
          }
          allCourseNames.push(course.name);
        }
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const semesters = args.value as any[];
    if (semesters) {
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

      return `Duplicate courses found: ${duplicates.join(', ')}`;
    }
    return 'Course names must be unique across all semesters';
  }
}

// Custom decorators remain the same
export function IsUniquePensumName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniquePensumNameConstraint,
    });
  };
}

export function HasMinimumCoursesPerSemester(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasMinimumCoursesPerSemesterConstraint,
    });
  };
}

export function HasUniqueCoursesAcrossSemesters(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasUniqueCoursesAcrossSemestersConstraint,
    });
  };
}
