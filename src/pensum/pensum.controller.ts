import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { PensumService } from './pensum.service';
import { CreatePensumDto } from './dto/createPensum.dto';
import { UpdatePensumDto } from './dto/updatePensum.dto';
import { AddCourseDto } from './dto/addCourse.dto';

@Controller('pensum')
export class PensumController {
  constructor(private pensumService: PensumService) {}

  // (C) Create a new pensum
  @Post()
  @HttpCode(201)
  create(@Body() createPensumDto: CreatePensumDto) {
    return this.pensumService.create(createPensumDto);
  }

  // (R) Get all pensums
  @Get()
  @HttpCode(200)
  findAll() {
    return this.pensumService.findAll();
  }

  // (R) Get a specific pensum
  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.pensumService.findOne(id);
  }

  // (U) Update a specific pensum
  @Patch(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updatePensumDto: UpdatePensumDto) {
    return this.pensumService.update(id, updatePensumDto);
  }

  // (D) Delete a specific pensum
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.pensumService.delete(id);
  }

  // ********Course management endpoints**********

  // (C) Add a new course to a specific pensum
  @Post(':id/course')
  @HttpCode(200)
  addCourse(@Param('id') id: string, @Body() addCourseDto: AddCourseDto) {
    return this.pensumService.addCourse(id, addCourseDto);
  }

  // (R) Get a specific course in a specific semester in a specific pensum
  @Get(':id/semester/:semesterNumber/course/:courseName')
  @HttpCode(200)
  findOneCourse(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
    @Param('courseName') courseName: string,
  ) {
    return this.pensumService.findOneCourse(
      id,
      parseInt(semesterNumber),
      courseName,
    );
  }

  // (R) Get all courses in a specific semester in a specific pensum
  @Get(':id/semester/:semesterNumber/course')
  @HttpCode(200)
  findAllCoursesInSemester(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
  ) {
    return this.pensumService.findAllCoursesInSemester(
      id,
      parseInt(semesterNumber),
    );
  }

  // (U) Update a course in a specific semester in a specific pensum
  @Patch(':id/semester/:semesterNumber/course/:courseName')
  @HttpCode(200)
  updateCourse(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
    @Param('courseName') courseName: string,
    @Body() updateCourseDto: AddCourseDto,
  ) {
    return this.pensumService.updateCourse(
      id,
      parseInt(semesterNumber),
      courseName,
      updateCourseDto,
    );
  }

  // (D) Remove a course from a specific semester in a specific pensum
  @Delete(':id/semester/:semesterNumber/course/:courseName')
  @HttpCode(200)
  removeCourse(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
    @Param('courseName') courseName: string,
  ) {
    return this.pensumService.removeCourse(
      id,
      parseInt(semesterNumber),
      courseName,
    );
  }
}
