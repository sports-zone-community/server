import { Server, Socket } from 'socket.io';
import { Chat, IChat } from '../models/chat.model';
import { Types } from 'mongoose';
import { User } from '../models/user.model';
import { IMessage } from '../models/message.model';
import { verify } from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
export class SocketService {
  private activeChats: Map<string, Set<string>> = new Map();
  private authenticatedSockets: Map<string, string> = new Map();

  private async authenticateToken(token: string): Promise<string> {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
      const decoded = verify(token, secret) as { id: string };
      return decoded.id;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  private static readonly TIME_FORMAT_OPTIONS = {
    hour: '2-digit',
    minute: '2-digit'
  } as const;
  
  private static readonly LOCALE = 'he-IL';

  constructor(private io: Server) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('Socket connected:', socket.id);
      
      this.handleAuthentication(socket);

      this.handlePrivateMessage(socket);
      this.handlePrivateMessage(socket);
      this.handleGroupMessage(socket);
      this.handleChatActivity(socket);
      this.handleDisconnect(socket);
      this.handleJoinGroup(socket);
    });
  }

  private handleAuthentication(socket: Socket) {
    socket.on('authenticate', async ({ token }: { token: string }) => {
      try {
        const userId = await this.authenticateToken(token);
        this.authenticatedSockets.set(socket.id, userId);
        await this.joinUserRooms(socket, userId);
        socket.emit('authenticated', { success: true });
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authenticated', { 
          success: false, 
          error: 'Authentication failed' 
        });
      }
    });
  }

  private getUserId(socket: Socket): string {
    const userId = this.authenticatedSockets.get(socket.id);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  private async joinUserRooms(socket: Socket, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (user.groups) {
      for (const groupId of user.groups) {
        const groupRoom = `group:${groupId.toString()}`;
        socket.join(groupRoom);
        console.log(`User ${userId} joined group ${groupId}`);
      }
    }
  }

  private formatMessageTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString(
      SocketService.LOCALE, 
      SocketService.TIME_FORMAT_OPTIONS
    );
  }

  private handlePrivateMessage(socket: Socket) {
    socket.on('private message', async ({ content, to, senderName }) => {
      try {
        const from = this.getUserId(socket);
        
        let chat: IChat | null = await Chat.findOne({
          participants: { $all: [from, to] },
          isGroupChat: false
        }) as IChat;

        if (!chat) {
          chat = await Chat.create({
            participants: [from, to],
            isGroupChat: false,
            messages: []
          });
        }

        const chatId = chat._id as string;
        const isRecipientActive = this.activeChats.get(chatId)?.has(to);
        
        const read = [new Types.ObjectId(from)];
        if (isRecipientActive) {
          read.push(new Types.ObjectId(to));
        }

        const message = {
          sender: new Types.ObjectId(from),
          content,
          timestamp: new Date(),
          read
        };

        chat.messages.push(message as IMessage);
        chat.lastMessage = message as IMessage;
        await chat.save();

        this.io.to(to).emit('new message', {
          chatId: chat._id,
          message: {
            ...message,
            formattedTime: this.formatMessageTime(message.timestamp)
          }
        });
        console.log('Emitting unread message to:', to);

        if (!isRecipientActive) {
          this.io.to(to).emit('unread message', {
            chatId: chat._id,
            from,
            senderName,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error handling private message:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
  }

  private handleGroupMessage(socket: Socket) {
    socket.on('group message', async ({ content, groupId, senderName }) => {
      try {
        const from = this.getUserId(socket);
        
        const chat: IChat | null = await Chat.findOne({ 
          groupId, 
          isGroupChat: true,
          participants: from
        }) as IChat;
        
        if (!chat) {
          throw new Error('Chat not found or user not authorized');
        }

        const chatId = chat._id as string;
        const activeUsers = this.activeChats.get(chatId) || new Set();
        
        const read = [new Types.ObjectId(from)];
        
        chat.participants.forEach((participantId: Types.ObjectId) => {
          const participantStringId = participantId.toString();
          if (activeUsers.has(participantStringId) && participantStringId !== from) {
            read.push(participantId);
          }
        });

        const message = {
          sender: new Types.ObjectId(from),
          senderName,
          content,
          timestamp: new Date(),
          read
        };

        chat.messages.push(message as IMessage);
        chat.lastMessage = message as IMessage;
        await chat.save();

        const formattedMessage = {
          sender: { _id: from, fullName: senderName },
          content: message.content,
          timestamp: message.timestamp,
          read: message.read,
          formattedTime: this.formatMessageTime(message.timestamp)
        };
        console.log('Emitting new message to group:', `group:${groupId}`);

        socket.to(`group:${groupId}`).emit('new message', {
          chatId: chat._id,
          message: formattedMessage
        });

        chat.participants.forEach((participantId: Types.ObjectId) => {
          const participantStringId = participantId.toString();
          if (!activeUsers.has(participantStringId) && participantStringId !== from) {
            this.io.to(participantStringId).emit('unread message', {
              chatId: chat._id,
              from,
              senderName,
              timestamp: new Date()
            });
          }
        });

      } catch (error) {
        console.error('Error handling group message:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
  }

  private handleDisconnect(socket: Socket) {
    socket.on('disconnect', () => {
      this.authenticatedSockets.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  }

  private handleChatActivity(socket: Socket) {
    socket.on('enterChat', async ({ chatId }) => {
      try {
        const userId = this.getUserId(socket);
        
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });
        
        if (!chat) {
          throw new Error('Chat not found or user not authorized');
        }

        if (!this.activeChats.has(chatId)) {
          this.activeChats.set(chatId, new Set());
        }
        this.activeChats.get(chatId)?.add(userId);
        
        console.log(`User ${userId} entered chat ${chatId}`);

        try {
          await Chat.updateMany(
            { _id: chatId },
            {
              $addToSet: {
                'messages.$[elem].read': new Types.ObjectId(userId)
              }
            },
            {
              arrayFilters: [
                { 
                  'elem.sender': { $ne: userId },
                  'elem.read': { $ne: new Types.ObjectId(userId) }
                }
              ]
            }
          );
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      } catch (error) {
        console.error('Error in chat activity:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    socket.on('leaveChat', (data: { userId: string, chatId: string }) => {
      const { userId, chatId } = data;
      this.activeChats.get(chatId)?.delete(userId);
      
      if (this.activeChats.get(chatId)?.size === 0) {
        this.activeChats.delete(chatId);
      }
      
      console.log(`User ${userId} left chat ${chatId}`);
    });
  }

  private handleJoinGroup(socket: Socket) {
    socket.on('joinGroup', async (groupId: string) => {
      try {
        const { userId } = socket.data;
        const groupRoom = `group:${groupId}`;
        socket.join(groupRoom);
        console.log(`User ${userId} joined group ${groupId}`);
        
        const groupChat = await Chat.findOne({ groupId, isGroupChat: true });
        if (groupChat) {
          socket.emit('group:joined', {
            success: true,
            groupId,
            chatId: groupChat._id
          });
        }
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('group:joined', {
          success: false,
          error: 'Failed to join group'
        });
      }
    });
  }
} 