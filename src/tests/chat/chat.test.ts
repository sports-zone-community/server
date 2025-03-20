import { Types } from 'mongoose';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { Chat, ChatModel } from '../../models';
import { createAndLoginTestUser, mockPopulateMock } from '../../utils';
import { FormattedMessage } from '../../utils/interfaces/chat';
import { Request } from 'express';

describe('CHAT ROUTES', () => {
  let token: string;
  let userId: string;
  let mockChat: any;
  let otherUserId: string;

  beforeEach(async () => {
    const user1 = await createAndLoginTestUser('user1@example.com');
    const user2 = await createAndLoginTestUser('user2@example.com');
    token = user1.accessToken;
    userId = user1.userId;
    otherUserId = user2.userId;

    mockChat = await ChatModel.create({
      participants: [userId, otherUserId],
      isGroupChat: false,
      messages: [
        {
          sender: new Types.ObjectId(otherUserId),
          content: 'Hello!',
          timestamp: new Date(),
          read: [],
        },
      ],
    });
  });

  describe('GET /chats', () => {
    it('should get user chats successfully', async () => {
      const response = await supertest(app).get('/chats').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0]).toHaveProperty('chatId');
      expect(response.body[0]).toHaveProperty('unreadCount');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).get('/chats').set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 200 with empty array when user has no chats', async () => {
      await ChatModel.deleteMany({ participants: userId });
      const response = await supertest(app).get('/chats').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when get error from Database', async () => {
      const mockPopulate: jest.Mock = jest
        .fn()
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockRejectedValueOnce(new Error('Database error'));

      const mockFind = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });

      jest.spyOn(ChatModel, 'find').mockImplementation(mockFind);

      const response = await supertest(app).get('/chats').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 200 with empty array when user has no chats', async () => {
      await ChatModel.deleteMany({ participants: userId });
      const response = await supertest(app).get('/chats').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle undefined user id', async () => {
      const req = { user: undefined } as unknown as Request;
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle empty chats result', async () => {
      await ChatModel.deleteMany({});
      const response = await supertest(app).get('/chats').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should handle isGroupChat query parameter', async () => {
      const responseGroupChats = await supertest(app)
        .get('/chats?isGroupChat=true')
        .set('Authorization', `Bearer ${token}`);
      
      expect(responseGroupChats.status).toBe(StatusCodes.OK);
      
      const responsePrivateChats = await supertest(app)
        .get('/chats?isGroupChat=false')
        .set('Authorization', `Bearer ${token}`);
      
      expect(responsePrivateChats.status).toBe(StatusCodes.OK);
    });
  });

  describe('PUT /chats/:chatId/read', () => {
    it('should mark messages as read successfully', async () => {
      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);

      const updatedChat = await ChatModel.findById(mockChat._id);
      expect(updatedChat?.messages[0].read.map((id) => id.toString())).toContain(userId.toString());
    });

    it('should return 400 for invalid chat ID', async () => {
      const response = await supertest(app)
        .put('/chats/invalid-id/read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 401 when user is not found', async () => {
      const response = await supertest(app)
        .put('/chats/invalid-id/read')
        .set('Authorization', `Bearer 32434343545`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 500 when chat update fails', async () => {
      jest.spyOn(ChatModel, 'updateMany').mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should handle validation error for invalid chatId', async () => {
      const response = await supertest(app)
        .put('/chats/invalid-id/read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
    });

    it('should handle undefined user id', async () => {
      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should successfully mark messages as read', async () => {
      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);

      const updatedChat = await ChatModel.findById(mockChat._id);
      expect(updatedChat?.messages[0].read).toContainEqual(new Types.ObjectId(userId));
    });

    it('should handle case when no messages need to be marked as read', async () => {
      await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      
      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      
      expect(response.body.result.modifiedCount).toBe(0);
    });
  });

  describe('GET /chats/messages/unread', () => {
    it('should get unread messages count successfully', async () => {
      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0]).toHaveProperty('unreadCount');
    });

    it('should return 500 when get error from Database', async () => {
      const mockPopulate: jest.Mock = jest
        .fn()
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockRejectedValueOnce(new Error('Database error'));

      const mockFind = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });

      jest.spyOn(ChatModel, 'find').mockImplementation(mockFind);

      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 200 with empty array when user has no unread messages', async () => {
      await ChatModel.updateMany(
        { participants: userId },
        { $set: { 'messages.$[].read': userId } },
      );

      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle case when user has both read and unread messages', async () => {
      const newChat: any = await ChatModel.create({
        participants: [userId, otherUserId],
        isGroupChat: false,
        messages: [
          {
            sender: new Types.ObjectId(otherUserId),
            content: 'Unread message',
            timestamp: new Date(),
            read: [],
          },
          {
            sender: new Types.ObjectId(otherUserId),
            content: 'Read message',
            timestamp: new Date(),
            read: [new Types.ObjectId(userId)],
          },
        ],
      });

      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      
      const unreadChat = response.body.find((chat: { chatId: Types.ObjectId; unreadCount: number }) => 
        chat.chatId.toString() === newChat._id.toString()
      );
      expect(unreadChat).toBeDefined();
      expect(unreadChat.unreadCount).toBe(1);
    });
  });

  describe('GET /chats/:chatId', () => {
    it('should get chat messages successfully and sort them correctly', async () => {
      await ChatModel.findByIdAndUpdate(mockChat._id, {
        $push: {
          messages: {
            sender: new Types.ObjectId(userId),
            content: 'Earlier message',
            timestamp: new Date('2024-02-20T10:00:00'),
            read: [],
          },
        },
      });

      const response = await supertest(app)
        .get(`/chats/${mockChat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();

      const messages = response.body;
      expect(messages[0].content).toBe('Earlier message');
      expect(messages[1].content).toBe('Hello!');
      expect(new Date(messages[0].timestamp).getTime()).toBeLessThan(
        new Date(messages[1].timestamp).getTime(),
      );

      messages.forEach((message: FormattedMessage) => {
        expect(message).toHaveProperty('messageId');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('sender');
        expect(message).toHaveProperty('timestamp');
        expect(message).toHaveProperty('formattedTime');
        expect(message).toHaveProperty('isRead');
      });
    });

    it('should return 404 for non-existent chat', async () => {
      const nonExistentId = new Types.ObjectId();
      const response = await supertest(app)
        .get(`/chats/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 400 for invalid chat ID', async () => {
      const response = await supertest(app)
        .get('/chats/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 500 when get error from Database', async () => {
      jest.spyOn(ChatModel, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await supertest(app)
        .get(`/chats/${mockChat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await supertest(app)
        .get(`/chats/${mockChat._id}`)
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle chat with no messages', async () => {
      // Create a chat with no messages
      const emptyChat = await ChatModel.create({
        participants: [userId, otherUserId],
        isGroupChat: false,
        messages: [],
      });

      const response = await supertest(app)
        .get(`/chats/${emptyChat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });

    it('should handle user not being a participant in the chat', async () => {
      const nonParticipantChat = await ChatModel.create({
        participants: [new Types.ObjectId(), otherUserId],
        isGroupChat: false,
        messages: [],
      });

      const response = await supertest(app)
        .get(`/chats/${nonParticipantChat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('POST /chats/ai/suggestion', () => {
    it('should get suggestion successfully', async () => {
      const response = await supertest(app)
        .post('/chats/ai/suggestion')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'Hello' });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('suggestion');
    });

    it('should return 401 when token is invalid', async () => {
      const response = await supertest(app)
        .post('/chats/ai/suggestion')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 400 when prompt is not provided', async () => {
      const response = await supertest(app)
        .post('/chats/ai/suggestion')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should handle empty prompt', async () => {
      const response = await supertest(app)
        .post('/chats/ai/suggestion')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: '' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should handle AI service errors', async () => {
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        Promise.reject(new Error('AI service error'))
      );

      const response = await supertest(app)
        .post('/chats/ai/suggestion')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
