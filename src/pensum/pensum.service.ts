/*eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createPensumDto: CreatePensumDto): Promise<Pensum> {
    const totalSemesters = createPensumDto.totalSemesters || 9;

    // If semesters are provided in the DTO, use them; otherwise create empty ones
    const semesters =
      createPensumDto.semesters && createPensumDto.semesters.length > 0
        ? createPensumDto.semesters
        : this.createEmptySemesters(totalSemesters);

    const pensum = this.pensumRepository.create({
      name: createPensumDto.name,
      totalSemesters,
      semesters: semesters, // Use the semesters from DTO or empty ones
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Creating pensum with semesters:', semesters); // Debug log

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

  // Course methods

  // (C)
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

  // (R) Find a specific course in a specific semester
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

  // (R) Find all courses in a specific semester
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

  // (U) Update a specific course
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

  // (D) Remove a course from a specific semester in a specific pensum
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
}
