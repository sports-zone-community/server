import { Types } from 'mongoose';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../app';
import { Chat } from '../../models/chat.model';
import { createUser, mockPopulateMock } from '../../utils/functions/testFunctions/testFunctions';
import { Message } from '../../utils/interfaces/chat';
import { Request } from 'express';

describe('CHAT ROUTES', () => {
  let token: string;
  let userId: string;
  let mockChat: any;
  let otherUserId: string;

  beforeEach(async () => {
    const user1 = await createUser('user1@example.com');
    const user2 = await createUser('user2@example.com');
    token = user1.token;
    userId = user1.userId;
    otherUserId = user2.userId;

    mockChat = await Chat.create({
      participants: [userId, otherUserId],
      isGroupChat: false,
      messages: [{
        sender: new Types.ObjectId(otherUserId),
        content: 'Hello!',
        timestamp: new Date(),
        read: []
      }]
    });
  });

  describe('GET /chats', () => {
    it('should get user chats successfully', async () => {
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0]).toHaveProperty('chatId');
      expect(response.body[0]).toHaveProperty('unreadCount');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).get('/chats');
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 200 with empty array when user has no chats', async () => {
      await Chat.deleteMany({ participants: userId });
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when get error from Database', async () => {
      const mockPopulate: jest.Mock = jest.fn()
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockRejectedValueOnce(new Error('Database error')); 
    
      const mockFind = jest.fn().mockReturnValue({
        populate: mockPopulate 
      });
    
      jest.spyOn(Chat, 'find').mockImplementation(mockFind);
    
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });    

    it('should return 200 with empty array when user has no chats', async () => {
      await Chat.deleteMany({ participants: userId });
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', `Bearer ${token}`);
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
      const req = { user: undefined } as Request;
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle empty chats result', async () => {
      await Chat.deleteMany({});
      const response = await supertest(app)
        .get('/chats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /chats/:chatId/read', () => {
    it('should mark messages as read successfully', async () => {
      const response = await supertest(app)
        .put(`/chats/${mockChat._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      
      const updatedChat = await Chat.findById(mockChat._id);
      expect(updatedChat?.messages[0].read.map(id => id.toString()))
        .toContain(userId.toString());
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
      jest.spyOn(Chat, 'updateMany').mockRejectedValueOnce(new Error('Database error'));
      
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
      
      // וידוא שההודעות סומנו כנקראות
      const updatedChat = await Chat.findById(mockChat._id);
      expect(updatedChat?.messages[0].read).toContainEqual(new Types.ObjectId(userId));
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
      const mockPopulate: jest.Mock = jest.fn()
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockRejectedValueOnce(new Error('Database error')); 
    
      const mockFind = jest.fn().mockReturnValue({
        populate: mockPopulate 
      });
    
      jest.spyOn(Chat, 'find').mockImplementation(mockFind);
    
      const response = await supertest(app)
        .get('/chats/messages/unread')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });    

    it('should return 200 with empty array when user has no unread messages', async () => {
      await Chat.updateMany(
        { participants: userId },
        { $set: { 'messages.$[].read': userId } }
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
  });

  describe('GET /chats/:chatId', () => {
    it('should get chat messages successfully and sort them correctly', async () => {
      await Chat.findByIdAndUpdate(mockChat._id, {
        $push: {
          messages: {
            sender: new Types.ObjectId(userId),
            content: 'Earlier message',
            timestamp: new Date('2024-02-20T10:00:00'),
            read: []
          }
        }
      });

      const response = await supertest(app)
        .get(`/chats/${mockChat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBeTruthy();
      
      const messages = response.body.messages;
      expect(messages[0].content).toBe('Earlier message');
      expect(messages[1].content).toBe('Hello!');
      expect(new Date(messages[0].timestamp).getTime()).toBeLessThan(new Date(messages[1].timestamp).getTime());
      
      messages.forEach((message: Message) => {
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
      const mockPopulate: jest.Mock = jest.fn()
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockImplementationOnce(mockPopulateMock)
        .mockRejectedValueOnce(new Error('Database error')); 
    
      const mockFind = jest.fn().mockReturnValue({
        populate: mockPopulate 
      });
    
      jest.spyOn(Chat, 'findById').mockImplementation(mockFind);
    
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
  }); 
}); 