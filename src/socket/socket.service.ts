import { Server, Socket } from 'socket.io';
import { Chat, ChatModel, GroupDocument, IMessage, UserDocument, UserModel } from '../models';
import { Types } from 'mongoose';
import { GroupRepository } from '../repositories';
import { verifyToken } from '../utils/auth.utils';
import { UnauthorizedError } from '../utils/errors';
import { ChatEvent, JoinGroupEvent } from '../utils/interfaces/socketService';
import { formatMessageTime } from '../utils/functions/formatMessageTime';

export class SocketService {
  private activeChats: Map<string, Set<string>> = new Map();
  private authenticatedSockets: Map<string, string> = new Map();

  constructor(private io: Server) {
    this.setupSocketHandlers();
  }

  private async authenticateSocket(socket: Socket): Promise<string> {
    const token: string = socket.handshake.auth.token;
    try {
      const { userId } = verifyToken(token);
      return userId;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  private getUserId(socket: Socket): string {
    const userId: string | undefined = this.authenticatedSockets.get(socket.id);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('Socket connected:', socket.id);

      try {
        const userId: string = await this.authenticateSocket(socket);
        this.authenticatedSockets.set(socket.id, userId);
        await this.joinUserRooms(socket, userId);
        
        this.handlePrivateMessage(socket);
        this.handleGroupMessage(socket);
        this.handleChatActivity(socket);
        this.handleDisconnect(socket);
        this.handleJoinGroup(socket);

        socket.emit('authenticated', { success: true });
      } catch (error) {
        this.handleError(socket, error as Error);
        socket.disconnect();
      }
    });
  }

  private async joinUserRooms(socket: Socket, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);

    const user: UserDocument | null = await UserModel.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const groups: GroupDocument[] = await GroupRepository.getGroupsByUserId(userId);

    groups.forEach((group: GroupDocument) => {
      const groupRoom: string = `group:${group.id.toString()}`;
      socket.join(groupRoom);
      console.log(`User ${userId} joined group ${group.id}`);
    });
  }


  private handlePrivateMessage(socket: Socket) {
    socket.on('private message', async ({ content, to, senderName }) => {
      try {
        const from: string = this.getUserId(socket);

        let chat: Chat | null = (await ChatModel.findOne({
          participants: { $all: [from, to] },
          isGroupChat: false,
        })) as Chat;

        if (!chat) {
          chat = await ChatModel.create({
            participants: [from, to],
            isGroupChat: false,
            messages: [],
          });
        }

        const chatId: string = chat._id as string;
        const isRecipientActive: boolean = this.activeChats.get(chatId)?.has(to) ?? false ;

        const read: Types.ObjectId[] = [new Types.ObjectId(from)];
        if (isRecipientActive) {
          read.push(new Types.ObjectId(to));
        }

        const message: IMessage = {
          sender: new Types.ObjectId(from),
          content,
          timestamp: new Date(),
          read,
          senderName,
          formattedTime: formatMessageTime(new Date()),
        } as IMessage;

        chat.messages.push(message);
        chat.lastMessage = message;
        await chat.save();

        const chatEvent: ChatEvent = {
          chatId: chat._id as Types.ObjectId,
          message: {
            content: message.content,
            timestamp: message.timestamp,
            sender: from
          }
        };

        this.io.to(to).emit('new message', {
          ...chatEvent,
          message: {
            ...chatEvent.message,
            formattedTime: formatMessageTime(message.timestamp),
          },
        });

        if (!isRecipientActive) {
          this.io.to(to).emit('unread message', {
            chatId: chat._id as Types.ObjectId,
            from,
            senderName,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        this.handleError(socket, error as Error);
      }
    });
  }

  private handleGroupMessage(socket: Socket) {
    socket.on('group message', async ({ content, groupId, senderName }) => {
      try {
        const from: string = this.getUserId(socket);

        const chat: Chat | null = (await ChatModel.findOne({
          groupId,
          isGroupChat: true,
          participants: from,
        })) as Chat;

        if (!chat) {
          throw new Error('Chat not found or user not authorized');
        }

        const chatId: string = chat._id as string;
        const activeUsers: Set<string> = this.activeChats.get(chatId) || new Set();

        const read: Types.ObjectId[] = [new Types.ObjectId(from)];

        chat.participants.forEach((participantId: Types.ObjectId) => {
          const participantStringId = participantId.toString();
          if (activeUsers.has(participantStringId) && participantStringId !== from) {
            read.push(participantId);
          }
        });

        const message: IMessage = {
          sender: new Types.ObjectId(from),
          senderName,
          content,
          timestamp: new Date(),
          read,
        } as IMessage;

        chat.messages.push(message);
        chat.lastMessage = message;
        await chat.save();

        const chatEvent: ChatEvent = {
          chatId: chat._id as Types.ObjectId,
          message: {
            content: message.content,
            timestamp: message.timestamp,
            sender: from
          }
        };

        socket.to(`group:${groupId}`).emit('new message', {
          ...chatEvent,
          message: {
            ...chatEvent.message,
            formattedTime: formatMessageTime(message.timestamp),
            sender: { _id: from, name: senderName }
          },
        });

        chat.participants.forEach((participantId: Types.ObjectId) => {
          const participantStringId = participantId.toString();
          if (!activeUsers.has(participantStringId) && participantStringId !== from) {
            this.io.to(participantStringId).emit('unread message', {
              chatId: chat._id as Types.ObjectId,
              from,
              senderName,
              timestamp: new Date(),
            });
          }
        });
      } catch (error) {
        this.handleError(socket, error as Error);
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
        const userId: string = this.getUserId(socket);

        const chat: Chat | null = await ChatModel.findOne({
          _id: chatId,
          participants: userId,
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
          await ChatModel.updateMany(
            { _id: chatId },
            {
              $addToSet: {
                'messages.$[elem].read': new Types.ObjectId(userId),
              },
            },
            {
              arrayFilters: [
                {
                  'elem.sender': { $ne: userId },
                  'elem.read': { $ne: new Types.ObjectId(userId) },
                },
              ],
            },
          );
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      } catch (error) {
        console.error('Error in chat activity:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    socket.on('leaveChat', (data: { userId: string; chatId: string }) => {
      const { userId, chatId } = data;
      this.activeChats.get(chatId)?.delete(userId);

      if (this.activeChats.get(chatId)?.size === 0) {
        this.activeChats.delete(chatId);
      }

      console.log(`User ${userId} left chat ${chatId}`);
    });
  }

  private handleJoinGroup(socket: Socket) {
    socket.on('joinGroup', async (data: JoinGroupEvent) => {
      try {
        const groupRoom = `group:${data.groupId}`;
        socket.join(groupRoom);
        console.log(`User ${data.userId} joined group ${data.groupId}`);

        const groupChat = await ChatModel.findOne({ 
          groupId: data.groupId, 
          isGroupChat: true 
        });
        
        if (groupChat) {
          socket.emit('group:joined', {
            success: true,
            groupId: data.groupId,
            chatId: groupChat._id,
          });
        }
      } catch (error) {
        this.handleError(socket, error as Error);
      }
    });
  }

  private handleError(socket: Socket, error: Error) {
    console.error('Socket error:', error);
    socket.emit('error', {
      message: error.message || 'Internal server error',
      code: error instanceof UnauthorizedError ? 'UNAUTHORIZED' : 'ERROR'
    });
  }
}
