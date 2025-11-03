import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: 'https://infosync-front-1.onrender.com', // Adjust for your frontend
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // Map to store connected users (socketId -> userId)

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      const decoded = jwt.verify(token, 'your_jwt_secret') as { userId: string };
      this.connectedUsers.set(client.id, decoded.userId);
      this.updateConnectedUsers();
      console.log(`User connected: ${decoded.userId}`);
    } catch (error) {
      console.error('Connection failed due to invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      console.log(`User disconnected: ${userId}`);
      this.connectedUsers.delete(client.id);
      this.updateConnectedUsers();
    }
  }

  private updateConnectedUsers() {
    this.server.emit('update_users', Array.from(this.connectedUsers.values()));
  }

  emitLikeCountUpdate(postId: string, likeCount: number) {
    this.server.emit('like_update', { postId, likeCount });
  }

  emitDislikeCountUpdate(postId: string, dislikeCount: number) {
    this.server.emit('dislike_update', { postId, dislikeCount });
  }

  emitCommentCountUpdate(postId: string, commentCount: number) {
    this.server.emit('comment_update', { postId, commentCount });
  }

  emitPostUpdate(postId: string, postData: any) {
    this.server.emit('post_update', { postId, ...postData });
  }

  // Example: Listen for client joining a post room
  @SubscribeMessage('joinPostRoom')
  handleJoinPostRoom(
    @MessageBody() postId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`post_${postId}`);
  }

  @SubscribeMessage('update_uid')
  handleUpdateUid(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, userId);
    this.updateConnectedUsers();
  }
}
