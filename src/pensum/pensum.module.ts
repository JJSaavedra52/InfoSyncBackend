import { Module, ValidationPipe } from '@nestjs/common';
import { PensumController } from './pensum.controller';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [PensumController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class PensumModule {}
