/*eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Pensum, Course } from './entity/pensum.entity';
import { CreatePensumDto } from './dto/createPensum.dto';
import { UpdatePensumDto } from './dto/updatePensum.dto';
import { AddCourseDto } from './dto/addCourse.dto';

@Injectable()
export class PensumService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  async create(createPensumDto: CreatePensumDto): Promise<Pensum> {
    const pensum = this.pensumRepository.create({
      ...createPensumDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.pensumRepository.save(pensum);
  }

  async findAll(): Promise<Pensum[]> {
    return await this.pensumRepository.find();
  }

  async findOne(id: string): Promise<Pensum | null> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }

    try {
      const pensum = await this.pensumRepository.findOne({
        where: { _id: new ObjectId(id) } as any,
      });
      return pensum;
    } catch (error) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }
  }

  async update(id: string, updateData: UpdatePensumDto): Promise<Pensum> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }

    try {
      await this.pensumRepository.update(
        { _id: new ObjectId(id) } as any,
        { 
          ...updateData, 
          updatedAt: new Date() 
        }
      );

      const updatedPensum = await this.findOne(id);
      if (!updatedPensum) {
        throw new NotFoundException(`Pensum with ID ${id} not found`);
      }

      return updatedPensum;
    } catch (error) {
      throw new NotFoundException(`Failed to update pensum with ID ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }

    try {
      const result = await this.pensumRepository.delete({ _id: new ObjectId(id) } as any);
      if (result.affected === 0) {
        throw new NotFoundException(`Pensum with ID ${id} not found`);
      }
    } catch (error) {
      throw new NotFoundException(`Failed to delete pensum with ID ${id}`);
    }
  }

  // Course management methods
  async addCourse(id: string, addCourseDto: AddCourseDto): Promise<Pensum> {
    const pensum = await this.findOne(id);
    if (!pensum) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }

    const semester = pensum.semesters.find(s => s.semesterNumber === addCourseDto.semesterNumber);
    if (!semester) {
      throw new NotFoundException(`Semester ${addCourseDto.semesterNumber} not found`);
    }

    const newCourse: Course = {
      name: addCourseDto.courseName,
      type: addCourseDto.courseType,
      // credits: addCourseDto.credits,
      // code: addCourseDto.code,
    };

    semester.courses.push(newCourse);

    return await this.update(id, { semesters: pensum.semesters });
  }

  async removeCourse(id: string, semesterNumber: number, courseName: string): Promise<Pensum> {
    const pensum = await this.findOne(id);
    if (!pensum) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }

    const semester = pensum.semesters.find(s => s.semesterNumber === semesterNumber);
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    semester.courses = semester.courses.filter(course => course.name !== courseName);

    return await this.update(id, { semesters: pensum.semesters });
  }

  async getSemester(id: string, semesterNumber: number): Promise<any> {
    const pensum = await this.findOne(id);
    if (!pensum) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }

    const semester = pensum.semesters.find(s => s.semesterNumber === semesterNumber);
    if (!semester) {
      throw new NotFoundException(`Semester ${semesterNumber} not found`);
    }

    return semester;
  }
}
