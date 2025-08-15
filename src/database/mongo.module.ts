/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pensum } from '../pensum/entity/pensum.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const user = configService.get('MONGODB_USER');
        const password = configService.get('MONGODB_PASSWORD');
        const host = configService.get('MONGODB_HOST');
        const cluster = configService.get('MONGODB_CLUSTER');
        const database = configService.get('MONGODB_DB');

        // Validate required environment variables
        if (!user || !password || !host || !cluster || !database) {
          throw new Error('Missing required MongoDB environment variables');
        }

        // Build the connection string dynamically
        const connectionString = `${cluster}://${user}:${password}@${host}/${database}?retryWrites=true&w=majority`;

        console.log('Built MongoDB Connection String:', connectionString);
        console.log('MongoDB Database:', database);

        return {
          type: 'mongodb' as const,
          url: connectionString,
          database: database,
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
