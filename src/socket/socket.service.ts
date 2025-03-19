import { Server, Socket } from 'socket.io';
import { Chat, ChatModel, GroupDocument, IMessage, UserDocument, UserModel } from '../models';
import { Types } from 'mongoose';
import { GroupRepository, ChatRepository, UserRepository } from '../repositories';
import { ChatEvent, JoinGroupEvent } from '../utils/interfaces/socketService';
import { formatMessageTime } from '../utils/functions/formatMessageTime';
import { PopulatedChat } from '../utils/interfaces/populated';
import { authenticateSocket, getUserId, handleError, joinUserRooms } from './socket.function';
export class SocketService {
  private activeChats: Map<string, Set<string>> = new Map();
  private authenticatedSockets: Map<string, string> = new Map();

  constructor(private io: Server) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('Socket connected:', socket.id);

      try {
        const userId: string = await authenticateSocket(socket);
        this.authenticatedSockets.set(socket.id, userId);
        await joinUserRooms(socket, userId);
        
        this.handlePrivateMessage(socket);
        this.handleGroupMessage(socket);
        this.handleChatActivity(socket);
        this.handleDisconnect(socket);
        this.handleJoinGroup(socket);
        this.handleFollowUser(socket);

        socket.emit('authenticated', { success: true });
      } catch (error) {
        handleError(socket, error as Error);
        socket.disconnect();
      }
    });
  }

  private async handlePrivateMessage(socket: Socket) {
    socket.on('private message', async ({ content, to, senderName }) => {
      try {
        const from: string = getUserId(socket, this.authenticatedSockets);

        let chat: Chat | null = await ChatRepository.findPrivateChat(from, to);

        if (!chat) {
          throw new Error('Chat not found. Please follow the user first.');
        }

        const chatId: string = chat._id as string;
        const isRecipientActive: boolean = this.activeChats.get(chatId)?.has(to) ?? false;

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

        await ChatRepository.saveMessage(chat, message);

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
        handleError(socket, error as Error);
      }
    });
  }

  private handleGroupMessage(socket: Socket) {
    socket.on('group message', async ({ content, groupId, senderName }) => {
      try {
        const from: string = getUserId(socket, this.authenticatedSockets);
        const chat: Chat | null = await ChatRepository.findGroupChat(new Types.ObjectId(groupId), new Types.ObjectId(from));

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

        await ChatRepository.saveMessage(chat, message);

        const chatEvent: ChatEvent = {
          chatId: chat._id as Types.ObjectId,
          message: {
            content: message.content,
            timestamp: message.timestamp,
            sender: from
          }
        };

        this.io.to(`group:${groupId}`).emit('new message', {
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
              ...chatEvent.message,
              timestamp: new Date(),
            });
          }
        });
      } catch (error) {
        handleError(socket, error as Error);
      }
    });
  }

  private handleDisconnect(socket: Socket) {
    socket.on('disconnect', () => {
      const userId = this.authenticatedSockets.get(socket.id);
      if (userId) {
        this.activeChats.forEach((users, chatId) => {
          if (users.has(userId)) {
            console.log(`Saving active chat state for user ${userId} in chat ${chatId}`);
          }
        });
      }
      this.authenticatedSockets.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  }

  private handleChatActivity(socket: Socket) {
    socket.on('enterChat', async ({ chatId }) => {
      try {
        const userId: string = getUserId(socket, this.authenticatedSockets);
        
        const chat: PopulatedChat | null = await ChatRepository.getChatByIdAndUserId(
          new Types.ObjectId(chatId),
          new Types.ObjectId(userId),
        );

        if (!chat) {
          throw new Error('Chat not found');
        }
        if (!this.activeChats.has(chatId)) {
          this.activeChats.set(chatId, new Set());
        }
        this.activeChats.get(chatId)?.add(userId);

        console.log(`User ${userId} entered chat ${chatId}`);

        try {
          await ChatRepository.updateMessagesReadStatus(
            new Types.ObjectId(chatId),
            new Types.ObjectId(userId)
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
        handleError(socket, error as Error);
      }
    });
  }

  private handleFollowUser(socket: Socket) {
    socket.on('followUser', async ({ followedUserId }) => {
      try {
        const followerId: string = getUserId(socket, this.authenticatedSockets);
        
        const follower: UserDocument = await UserRepository.getUserById(followerId);
        const followed: UserDocument = await UserRepository.getUserById(followedUserId);
        
        if (!follower || !followed) {
          throw new Error('User not found');
        }
        
        let chat: Chat | null = await ChatRepository.findPrivateChat(followerId, followedUserId);
        
        if (!chat) {
          chat = await ChatRepository.createPrivateChat(followerId, followedUserId);
          
          this.io.to(followerId).emit('chatCreated', {
            chatId: chat._id,
            participants: chat.participants,
            isGroupChat: false,
            otherUser: {
              _id: followed._id,
              name: followed.name,
              picture: followed.picture
            }
          });
          
          this.io.to(followedUserId).emit('chatCreated', {
            chatId: chat._id,
            participants: chat.participants,
            isGroupChat: false,
            otherUser: {
              _id: follower._id,
              name: follower.name,
              picture: follower.picture
            }
          });
          
          console.log(`Chat created between ${followerId} and ${followedUserId} due to follow action`);
        }
      } catch (error) {
        handleError(socket, error as Error);
      }
    });
  }
}
