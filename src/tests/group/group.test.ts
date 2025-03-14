import { Types } from 'mongoose';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { ChatModel, GroupModel, UserModel } from '../../models';
import { createAndLoginTestUser } from '../../utils';

describe('GROUP ROUTES', () => {
  let token: string;
  let userId: string;
  let mockGroup: any;

  beforeAll(async () => {
    const loginResponse = await createAndLoginTestUser();
    token = loginResponse.accessToken;
    userId = loginResponse.userId;

    mockGroup = {
      name: 'Test Group',
      description: 'Test Description',
      members: [],
      creatorId: userId,
    };
  });

  describe('POST /groups/create', () => {
    it('should create a new group successfully', async () => {
      const response = await supertest(app)
        .post('/groups')
        .send(mockGroup)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(mockGroup.name);
      expect(response.body.description).toBe(mockGroup.description);

      const group = await GroupModel.findById(response.body._id);
      const chat = await ChatModel.findOne({ groupId: response.body._id });

      expect(group).toBeTruthy();
      expect(chat).toBeTruthy();
    });

    it('should return error for invalid group data', async () => {
      const invalidGroup = {
        description: 'Missing required fields',
      };

      const response = await supertest(app)
        .post('/groups')
        .send(invalidGroup)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(GroupModel, 'create').mockRejectedValue(new Error('Database error'));

      const response = await supertest(app)
        .post('/groups')
        .send(mockGroup)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBe('Database error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).post('/groups').send(mockGroup);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 401 when user is not found', async () => {
      const response = await supertest(app)
        .post('/groups')
        .send(mockGroup)
        .set('Authorization', `Bearer 32434343545`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST /groups/:groupId/join', () => {
    let mockChat: any;

    beforeEach(async () => {
      const loginResponse = await createAndLoginTestUser();
      token = loginResponse.accessToken;
      userId = loginResponse.userId;

      mockGroup = await GroupModel.create({
        name: 'Test Group',
        description: 'Test Description',
        creator: new Types.ObjectId(),
        members: [],
        admins: [new Types.ObjectId()],
      });

      mockChat = await ChatModel.create({
        isGroupChat: true,
        groupId: mockGroup._id,
        groupName: mockGroup.name,
        participants: [],
      });
    });

    it('should allow user to join group successfully', async () => {
      const response = await supertest(app)
        .post(`/groups/${mockGroup._id}/join`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);

      const updatedGroup = await GroupModel.findById(mockGroup._id);
      const updatedChat = await ChatModel.findById(mockChat._id);
      const updatedUser = await UserModel.findById(userId);

      expect(updatedGroup?.members.map((id) => id.toString())).toContain(userId.toString());
      expect(updatedChat?.participants.map((id) => id.toString())).toContain(userId.toString());
    });

    it('should return error for non-existent group', async () => {
      const nonExistentGroupId = new Types.ObjectId();
      const response = await supertest(app)
        .post(`/groups/${nonExistentGroupId}/join`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe('Group not found');
    });

    it('should return error for invalid group ID', async () => {
      const invalidGroupId = 'invalid-id';

      const response = await supertest(app)
        .post(`/groups/${invalidGroupId}/join`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(GroupModel, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));

      const response = await supertest(app)
        .post(`/groups/${mockGroup._id}/join`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBe('Database error');
    });

    it('should return 404 when group is not found', async () => {
      jest.spyOn(GroupModel, 'findByIdAndUpdate').mockResolvedValue(null);

      const response = await supertest(app)
        .post(`/groups/${mockGroup._id}/join`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe('Group not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).post(`/groups/${mockGroup._id}/join`).send();

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
