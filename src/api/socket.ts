import { io, Socket } from 'socket.io-client';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  private constructor() { }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initializeSocket(token: string): Socket {
    // If socket already created, DO NOT recreate or reconnect
    if (this.socket) {
      // Even if disconnected, we reconnect without creating new instance
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    // Prevent duplicate connection attempts
    if (this.isConnecting) {
      return this.socket!;
    }

    this.isConnecting = true;

    this.socket = io("https://communication-production-a104.up.railway.app", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnecting = false;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return this.socket;
  }


  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  public joinChannel(channelId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('joinChat', channelId);
      console.log(`Joined channel: ${channelId}`);
    }
  }

  public leaveChannel(channelId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leaveChat', channelId);
      console.log(`Left channel: ${channelId}`);
    }
  }
}

export const socketManager = SocketManager.getInstance();