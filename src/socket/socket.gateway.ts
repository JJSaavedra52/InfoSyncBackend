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
    origin: ['https://infosync-front-1.onrender.com'], // Permitir el frontend local
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // Map to store connected users (socketId -> userId)

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (token) {
        console.log(`Connection attempt from client: ${client.id}`);
        console.log(`Token received: ${token}`);
        const decoded = jwt.verify(token, 'your_jwt_secret') as { sub: string; role: string };
        console.log(`Decoded token:`, decoded);
        if (decoded && decoded.sub) {
          this.updateConnectedUsers();
          this.connectedUsers.set(client.id, decoded.sub); // Use `sub` as userId
          console.log(`User connected: ${decoded.sub}`);
        } else {
          console.error(`Token decoding failed: sub is undefined`);
        }
      } else {
        console.log(`Connection attempt from client ${client.id} without token. Limited access granted.`);
      }
    } catch (error) {
      console.error(`Connection failed for client ${client.id}:`, error.message);
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
    console.log(`Emitted update_users with connected users:`, Array.from(this.connectedUsers.values()));
  }

  emitLikeCountUpdate(postId: string, likeCount: number) {
    this.server.to(`post_${postId}`).emit('like_update', { postId, likeCount });
    console.log(`Emitted like_update for postId: ${postId} with likeCount: ${likeCount} to room post_${postId}`);
  }

  emitDislikeCountUpdate(postId: string, dislikeCount: number) {
    this.server.to(`post_${postId}`).emit('dislike_update', { postId, dislikeCount });
    console.log(`Emitted dislike_update for postId: ${postId} with dislikeCount: ${dislikeCount} to room post_${postId}`);
  }

  emitCommentCountUpdate(postId: string, commentCount: number) {
    this.server.emit('comment_update', { postId, commentCount });
    console.log(`Emitted comment_update for postId: ${postId} with commentCount: ${commentCount}`);
  }

  emitPostUpdate(postId: string, postData: any) {
    this.server.emit('post_update', { postId, ...postData });
  }

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

  @SubscribeMessage('handshake')
  handleHandshake(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string; user: any },
    callback: any,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      console.log(`Handshake received from client: ${client.id}, userId: ${userId}`);
      console.log(`Callback type: ${typeof callback}`);
      if (typeof callback !== 'function') {
        console.error(`Handshake failed: callback is not a function for client ${client.id}`);
        return;
      }
      if (userId) {
        console.log(`Handshake successful for user: ${userId}`);
        callback(userId, Array.from(this.connectedUsers.values()));
      } else {
        console.error('Handshake failed: User not found');
        callback('', []);
      }
    } catch (error) {
      console.error(`Error in handshake for client ${client.id}:`, error.message);
      if (typeof callback === 'function') {
        callback('', []);
      }
    }
  }

  @SubscribeMessage('like_update')
  handleLikeUpdate(
    @MessageBody() data: { postId: string; likeCount: number },
    @ConnectedSocket() client: Socket,
  ): { status: string } {
    console.log(`Received like_update from client ${client.id} for postId: ${data.postId} with likeCount: ${data.likeCount}`);
    // Broadcast to everyone in the post room (including sender if you want; use this.server.to to include sender)
    this.server.to(`post_${data.postId}`).emit('like_update', { postId: data.postId, likeCount: data.likeCount });
    console.log(`Broadcasted like_update to room post_${data.postId}`);
    return { status: 'success' };
  }

  @SubscribeMessage('dislike_update')
  handleDislikeUpdate(
    @MessageBody() data: { postId: string; dislikeCount: number },
    @ConnectedSocket() client: Socket,
  ): { status: string } {
    console.log(`Received dislike_update from client ${client.id} for postId: ${data.postId} with dislikeCount: ${data.dislikeCount}`);
    this.server.to(`post_${data.postId}`).emit('dislike_update', { postId: data.postId, dislikeCount: data.dislikeCount });
    console.log(`Broadcasted dislike_update to room post_${data.postId}`);
    return { status: 'success' };
  }

  @SubscribeMessage('comment_update')
  handleCommentUpdate(
    @MessageBody() data: { postId: string; commentCount: number },
    @ConnectedSocket() client: Socket,
  ): { status: string } {
    console.log(`Received comment_update from client ${client.id} for postId: ${data.postId} with commentCount: ${data.commentCount}`);
    this.server.to(`post_${data.postId}`).emit('comment_update', { postId: data.postId, commentCount: data.commentCount });
    console.log(`Broadcasted comment_update to room post_${data.postId}`);
    return { status: 'success' };
  }

  @SubscribeMessage('subcomment_update')
  handleSubcommentUpdate(
    @MessageBody() data: { postId: string; commentId: string; subcommentCount: number },
    @ConnectedSocket() client: Socket,
  ): { status: string } {
    console.log(`Received subcomment_update from client ${client.id} for postId: ${data.postId}, commentId: ${data.commentId} with subcommentCount: ${data.subcommentCount}`);
    // Emit the update to other clients in the same post room
    client.to(`post_${data.postId}`).emit('subcomment_update', data);
    return { status: 'success' };
  }
}
