import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  ParseIntPipe,
  ParseBoolPipe,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';

import { CreatePensumDto } from './dto/createPensum.dto';

@Controller('pensum')
export class PensumController {
  // C
  @Post()
  @HttpCode(201)
  create(
    @Body()
    body: CreatePensumDto,
  ) {
    return body;
  }

  // R
  @Get('getAllPensums')
  @HttpCode(200)
  findAll() {
    return [];
  }

  // R
  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id, @Query('sort', ParseBoolPipe) sort) {
    console.log(typeof id);
    console.log(typeof sort);

    return id;
  }

  // U
  @Patch('updatePensum/:id')
  @HttpCode(200)
  update(
    @Body()
    body: CreatePensumDto,
  ) {
    return body;
  }

  // D
  @Delete('deletePensum/:id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return;
  }
}
