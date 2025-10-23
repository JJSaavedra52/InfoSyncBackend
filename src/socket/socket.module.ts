import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway],
  exports: [SocketGateway], // Export so other modules (like PostService) can use it
})
export class SocketModule {}
