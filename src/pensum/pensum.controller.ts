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

  @Post()
  @HttpCode(201)
  create(@Body() createPensumDto: CreatePensumDto) {
    return this.pensumService.create(createPensumDto);
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.pensumService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.pensumService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id') id: string,
    @Body() updatePensumDto: UpdatePensumDto,
  ) {
    return this.pensumService.update(id, updatePensumDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.pensumService.delete(id);
  }

  // Course management endpoints
  @Post(':id/course')
  @HttpCode(200)
  addCourse(
    @Param('id') id: string,
    @Body() addCourseDto: AddCourseDto,
  ) {
    return this.pensumService.addCourse(id, addCourseDto);
  }

  @Delete(':id/semester/:semesterNumber/course/:courseName')
  @HttpCode(200)
  removeCourse(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
    @Param('courseName') courseName: string,
  ) {
    return this.pensumService.removeCourse(id, parseInt(semesterNumber), courseName);
  }

  @Get(':id/semester/:semesterNumber')
  @HttpCode(200)
  getSemester(
    @Param('id') id: string,
    @Param('semesterNumber') semesterNumber: string,
  ) {
    return this.pensumService.getSemester(id, parseInt(semesterNumber));
  }
}
