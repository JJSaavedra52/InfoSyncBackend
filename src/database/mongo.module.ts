import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pensum } from '../pensum/entity/pensum.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log('MongoDB Connection String:', configService.get('MONGODB_CONNECTION_STRING'));
        console.log('MongoDB Database:', configService.get('MONGODB_DB'));

        return {
          type: 'mongodb',
          url: configService.get('MONGODB_CONNECTION_STRING'),
          database: configService.get('MONGODB_DB'),
          entities: [Pensum],
          synchronize: true,
          logging: true,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class MongoModule {}