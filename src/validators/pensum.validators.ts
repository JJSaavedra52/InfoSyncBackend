import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Pensum } from 'src/pensum/entity/pensum.entity';

// 1. Unique Pensum Name Validator
@ValidatorConstraint({ name: 'isUniquePensumName', async: true })
@Injectable()
export class IsUniquePensumNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  async validate(name: string): Promise<boolean> {
    const existingPensum = await this.pensumRepository.findOne({
      where: { name } as any,
    });
    return !existingPensum;
  }

  defaultMessage(): string {
    return 'Pensum name already exists';
  }
}

// 2. Minimum Courses Per Semester Validator
@ValidatorConstraint({ name: 'hasMinimumCoursesPerSemester' })
export class HasMinimumCoursesPerSemesterConstraint
  implements ValidatorConstraintInterface
{
  validate(semesters: any[]): boolean {
    if (!semesters) return true; // Skip validation if no semesters provided

    return semesters.every(
      (semester) => !semester.courses || semester.courses.length >= 5,
    );
  }

  defaultMessage(): string {
    return 'Each semester must have at least 5 courses';
  }
}

// 3. Unique Courses Across Semesters Validator
@ValidatorConstraint({ name: 'hasUniqueCoursesAcrossSemesters' })
export class HasUniqueCoursesAcrossSemestersConstraint
  implements ValidatorConstraintInterface
{
  validate(semesters: any[]): boolean {
    if (!semesters) return true; // Skip validation if no semesters provided

    const allCourseNames: string[] = [];

    for (const semester of semesters) {
      if (semester.courses) {
        for (const course of semester.courses) {
          if (allCourseNames.includes(course.name)) {
            return false; // Duplicate course found
          }
          allCourseNames.push(course.name);
        }
      }
    }

    return true;
  }

  defaultMessage(): string {
    return 'Course names must be unique across all semesters';
  }
}

// Custom decorators
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
