/*eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Pensum } from './entity/pensum.entity';
import { CreatePensumDto } from './dto/createPensum.dto';
import { UpdatePensumDto } from './dto/updatePensum.dto';
import { AddCourseDto } from './dto/addCourse.dto';

@Injectable()
export class PensumService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  // Helper method to create empty semesters
  private createEmptySemesters(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      semesterNumber: index + 1,
      courses: [],
    }));
  }

  // Validation methods
  private async validateUniqueName(name: string): Promise<void> {
    const existingPensum = await this.pensumRepository.findOne({
      where: { name } as any,
    });

    if (existingPensum) {
      throw new BadRequestException('Pensum name already exists');
    }
  }

  private validateMinimumSemesters(semesters: any[]): void {
    if (!semesters || semesters.length < 9) {
      throw new BadRequestException('Pensum must have at least 9 semesters');
    }
  }

  private validateMinimumCoursesPerSemester(semesters: any[]): void {
    if (!semesters) return;

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

  private validateUniqueCoursesAcrossSemesters(semesters: any[]): void {
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

  async create(createPensumDto: CreatePensumDto): Promise<Pensum> {
    // Run all validations
    await this.validateUniqueName(createPensumDto.name);
    this.validateMinimumSemesters(createPensumDto.semesters);
    this.validateMinimumCoursesPerSemester(createPensumDto.semesters);
    this.validateUniqueCoursesAcrossSemesters(createPensumDto.semesters);

    const totalSemesters = createPensumDto.totalSemesters || 9;

    const semesters =
      createPensumDto.semesters && createPensumDto.semesters.length > 0
        ? createPensumDto.semesters
        : this.createEmptySemesters(totalSemesters);

    const pensum = this.pensumRepository.create({
      name: createPensumDto.name,
      totalSemesters,
      semesters: semesters,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.pensumRepository.save(pensum);
  }

  async findAll(): Promise<Pensum[]> {
    return await this.pensumRepository.find();
  }

  async findOne(id: string): Promise<Pensum> {
    const pensum = await this.pensumRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { _id: new ObjectId(id) } as any,
    });

    if (!pensum) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }

    return pensum;
  }

  async update(id: string, updateData: UpdatePensumDto): Promise<Pensum> {
    await this.pensumRepository.update({ _id: new ObjectId(id) } as any, {
      ...updateData,
      updatedAt: new Date(),
    });

    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.pensumRepository.delete({
      _id: new ObjectId(id),
    } as any);

    if (result.affected === 0) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }
  }

  async addCourse(id: string, addCourseDto: AddCourseDto): Promise<Pensum> {
    const pensum = await this.findOne(id);

    // Find the semester
    const semester = pensum.semesters.find(
      (s) => s.semesterNumber === addCourseDto.semesterNumber,
    );

    if (!semester) {
      throw new NotFoundException(
        `Semester ${addCourseDto.semesterNumber} not found`,
      );
    }

    // Add the course
    semester.courses.push({
      name: addCourseDto.courseName,
      type: addCourseDto.courseType,
    });

    return await this.update(id, { semesters: pensum.semesters });
  }

  async removeCourse(
    id: string,
    semesterNumber: number,
    courseName: string,
  ): Promise<Pensum> {
    const pensum = await this.findOne(id);

    const semester = pensum.semesters.find(
      (s) => s.semesterNumber === semesterNumber,
    );
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    semester.courses = semester.courses.filter(
      (course) => course.name !== courseName,
    );

    return await this.update(id, { semesters: pensum.semesters });
  }

  // Add the missing methods your controller is calling
  async findOneCourse(id: string, semesterNumber: number, courseName: string) {
    const pensum = await this.findOne(id);

    const semester = pensum.semesters.find(
      (s) => s.semesterNumber === semesterNumber,
    );
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    const course = semester.courses.find((c) => c.name === courseName);
    if (!course) {
      throw new NotFoundException(
        `Course ${courseName} not found in semester ${semesterNumber}`,
      );
    }

    return {
      pensumId: id,
      semesterNumber,
      course,
    };
  }

  async findAllCoursesInSemester(id: string, semesterNumber: number) {
    const pensum = await this.findOne(id);

    const semester = pensum.semesters.find(
      (s) => s.semesterNumber === semesterNumber,
    );
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    return {
      pensumId: id,
      pensumName: pensum.name,
      semesterNumber,
      courses: semester.courses,
      totalCourses: semester.courses.length,
    };
  }

  async updateCourse(
    id: string,
    semesterNumber: number,
    courseName: string,
    updateCourseDto: AddCourseDto,
  ): Promise<Pensum> {
    const pensum = await this.findOne(id);

    const semester = pensum.semesters.find(
      (s) => s.semesterNumber === semesterNumber,
    );
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    const courseIndex = semester.courses.findIndex(
      (c) => c.name === courseName,
    );
    if (courseIndex === -1) {
      throw new NotFoundException(
        `Course ${courseName} not found in semester ${semesterNumber}`,
      );
    }

    // Update the course
    semester.courses[courseIndex] = {
      name: updateCourseDto.courseName,
      type: updateCourseDto.courseType,
    };

    return await this.update(id, { semesters: pensum.semesters });
  }
}
