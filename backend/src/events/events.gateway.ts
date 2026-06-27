import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    client.join(`order:${orderId}`);
    console.log(`Client ${client.id} joined order room: ${orderId}`);
  }

  notifyOrderStatusChange(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('orderStatusChanged', { orderId, status });
  }

  notifyNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }

  notifyPaymentReceived(orderId: string, amount: number) {
    this.server.to(`order:${orderId}`).emit('paymentReceived', { orderId, amount });
  }
}
