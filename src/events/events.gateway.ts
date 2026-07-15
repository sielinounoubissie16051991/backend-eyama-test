import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connecte: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client deconnecte: ${client.id}`);
  }

  emitObjectCreated(object: any) {
    this.server.emit('object:created', object);
  }

  emitObjectDeleted(id: string) {
    this.server.emit('object:deleted', id);
  }
}
