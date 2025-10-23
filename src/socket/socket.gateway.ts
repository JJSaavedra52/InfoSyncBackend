import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://infosync-front-1.onrender.com', // Adjust for your frontend
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  emitLikeCountUpdate(postId: string, likeCount: number) {
    this.server.emit('likeCountUpdate', { postId, likeCount });
  }

  emitDislikeCountUpdate(postId: string, dislikeCount: number) {
    this.server.emit('dislikeCountUpdate', { postId, dislikeCount });
  }

  emitCommentCountUpdate(postId: string, commentCount: number) {
    this.server.emit('commentCountUpdate', { postId, commentCount });
  }

  // Example: Listen for client joining a post room
  @SubscribeMessage('joinPostRoom')
  handleJoinPostRoom(
    @MessageBody() postId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`post_${postId}`);
  }
}
