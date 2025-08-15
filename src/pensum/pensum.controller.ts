import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { PensumService } from './pensum.service';
import { CreatePensumDto } from './dto/createPensum.dto';

@Controller('pensum')
export class PensumController {
  constructor(private pensumService: PensumService) {}

  // C
  @Post()
  @HttpCode(201)
  create(@Body() createPensumDto: CreatePensumDto) {
    return this.pensumService.create(createPensumDto);
  }

  // R
  @Get()
  @HttpCode(200)
  findAll() {
    return this.pensumService.findAll();
  }

  // R
  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.pensumService.findOne(id);
  }

  // U
  @Patch('updatePensum/:id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() body: CreatePensumDto) {
    return this.pensumService.update(id, body);
  }

  // D
  @Delete('deletePensum/:id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.pensumService.delete(id);
  }
}
