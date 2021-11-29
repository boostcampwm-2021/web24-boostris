import { RemoteSocket, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface userRemote extends RemoteSocket<DefaultEventsMap> {
  userName: string;
  oauthID: string;
}

export interface userSocket extends Socket {
  userName: string;
  roomID: string;
  oauthID: string;
}
