/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Pensum } from './entity/pensum.entity';
import { CreatePensumDto } from './dto/createPensum.dto';
import { UpdatePensumDto } from './dto/updatePensum.dto';
import { AddCourseDto } from './dto/addCourse.dto';
import { PensumValidationService } from './validators/pensum-validation.service'; // Add this import

@Injectable()
export class PensumService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
    private pensumValidationService: PensumValidationService, // Inject the validation service
  ) {}

  async create(createPensumDto: CreatePensumDto): Promise<Pensum> {
    await this.pensumValidationService.validateAdmin(createPensumDto.userId);
    // Run all validations
    await this.pensumValidationService.validatePensumCreation(createPensumDto);

    const totalSemesters = createPensumDto.totalSemesters || 9;

    const pensum = this.pensumRepository.create({
      name: createPensumDto.name,
      totalSemesters,
      semesters: createPensumDto.semesters,
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
    if (!updateData.userId) {
      throw new BadRequestException('userId is required to update a pensum');
    }
    await this.pensumValidationService.validateAdmin(updateData.userId);

    await this.pensumRepository.update({ _id: new ObjectId(id) } as any, {
      ...updateData,
      updatedAt: new Date(),
    });

    return await this.findOne(id);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    if (!userId) {
      throw new BadRequestException('userId is required to delete a pensum');
    }
    await this.pensumValidationService.validateAdmin(userId);

    const result = await this.pensumRepository.delete({
      _id: new ObjectId(id),
    } as any);

    if (result.affected === 0) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }

    return { message: `Pensum with ID ${id} has been successfully deleted` };
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
