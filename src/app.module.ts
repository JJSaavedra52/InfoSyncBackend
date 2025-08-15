import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PensumModule } from './pensum/pensum.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PensumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
