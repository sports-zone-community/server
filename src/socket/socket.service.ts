import { Server, Socket } from 'socket.io';
import { Chat, IChat, IMessage } from '../models/chat.model';
import { Types } from 'mongoose';
import { User } from '../models/user.model';

export class SocketService {
  private io: Server;
  private activeChats: Map<string, Set<string>> = new Map();
  
  private static readonly TIME_FORMAT_OPTIONS = {
    hour: '2-digit',
    minute: '2-digit'
  } as const;
  
  private static readonly LOCALE = 'he-IL';

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('Socket connected:', socket.id);
      
      this.handleUserConnection(socket);
      this.handlePrivateMessage(socket);
      this.handleGroupMessage(socket);
      this.handleChatActivity(socket);
      this.handleDisconnect(socket);
    });
  }

  private async handleUserConnection(socket: Socket) {
    socket.on('user:connect', async (userId: string) => {
      try {
        console.log(`Attempting to connect user: ${userId}`);
        await this.joinUserRooms(socket, userId);
        socket.emit('user:connected', { success: true });
      } catch (error) {
        console.error('Error in connection setup:', error);
        socket.emit('user:connected', { 
          success: false, 
          error: 'Failed to connect user' 
        });
      }
    });
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
    socket.on('private message', async (data) => {
      const { content, to, from, senderName } = data;
      
      try {
        let chat = await Chat.findOne({
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

        const chatId = chat._id.toString();
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
      }
    });
  }

  private handleGroupMessage(socket: Socket) {
    socket.on('group message', async (data) => {
      const { content, groupId, from, senderName } = data;

      try {
        const chat = await Chat.findOne({ groupId, isGroupChat: true }) as IChat;
        if (!chat) return;

        const chatId = chat._id.toString();
        const activeUsers = this.activeChats.get(chatId) || new Set();
        
        const read = [new Types.ObjectId(from)];
        
        chat.participants.forEach(participantId => {
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
      }
    });
  }

  private handleDisconnect(socket: Socket) {
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  }

  private handleChatActivity(socket: Socket) {
    socket.on('enterChat', async (data: { userId: string, chatId: string }) => {
      const { userId, chatId } = data;
      
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
} 