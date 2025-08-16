import { PartialType } from '@nestjs/mapped-types';
import { CreatePensumDto } from './createPensum.dto';

export class UpdatePensumDto extends PartialType(CreatePensumDto) {}
