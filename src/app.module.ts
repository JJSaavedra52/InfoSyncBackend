import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PensumModule } from './pensum/pensum.module';

@Module({
  imports: [PensumModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
