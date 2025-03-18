import { Types } from 'mongoose';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import { ChatModel, GroupDocument, GroupModel, UserModel } from '../../models';
import { createAndLoginTestUser } from '../../utils';
import { CreateGroupObject } from '../../validations';

describe('GROUP ROUTES', () => {
  let token: string;
  let userId: string;
  let mockGroup: GroupDocument;
  let mockGroupData: CreateGroupObject;

  beforeEach(async () => {
    const loginResponse = await createAndLoginTestUser();
    token = loginResponse.accessToken;
    userId = loginResponse.userId;

    mockGroupData = {
      name: 'Test Group',
      description: 'Test Description',
    };
  });

  describe('GET /groups', () => {
    it('should return empty array when no groups are created', async () => {
      const response = await supertest(app).get('/groups').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return all groups successfully', async () => {
      await GroupModel.create({
        name: 'Test Group',
        description: 'Test Description',
        creator: new Types.ObjectId(),
        members: [],
        admins: [new Types.ObjectId()],
      });
      const response = await supertest(app).get('/groups').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([mockGroup]);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).get('/groups').set('Authorization', `Bearer invalid-token`);
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(GroupModel, 'find').mockRejectedValue(new Error('Database error'));
      const response = await supertest(app).get('/groups').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBe('[InternalServerError]: Database error');
    });
  });

  describe('POST /groups/create', () => {
    it('should create a new group successfully', async () => {
      const response = await supertest(app)
        .post('/groups')
        .send(mockGroupData)
        .set('Authorization', `Bearer ${token}`);
         
      mockGroup = response.body;

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
        .send(mockGroupData)
        .set('Authorization', `Bearer ${token}`);

      console.log('response',response.body);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBe('[InternalServerError]: Database error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).post('/groups').send(mockGroupData).set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 401 when user is not found', async () => {
      const response = await supertest(app)
        .post('/groups')
        .send(mockGroupData)
        .set('Authorization', `Bearer 32434343545`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST /groups/:groupId', () => {
    let mockChat: any;

    beforeEach(async () => {
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
        .post(`/groups/toggle-join/${mockGroup._id}`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);

      const updatedGroup = await GroupModel.findById(mockGroup._id);
      const updatedChat = await ChatModel.findById(mockChat._id);

      expect(updatedGroup?.members.map((id: Types.ObjectId) => id.toString())).toContain(userId.toString());
      expect(updatedChat?.participants.map((id: Types.ObjectId) => id.toString())).toContain(userId.toString());
    });

    it('should return error for non-existent group', async () => {
      const nonExistentGroupId: string = new Types.ObjectId().toString();
      const response = await supertest(app)
        .post(`/groups/toggle-join/${nonExistentGroupId}`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe('[NotFoundError]: Group not found');
    });

    it('should return error for invalid group ID', async () => {
      const invalidGroupId: string = 'invalid-id';

      const response = await supertest(app)
        .post(`/groups/toggle-join/${invalidGroupId}`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(GroupModel, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));

      const response = await supertest(app)
        .post(`/groups/toggle-join/${mockGroup._id}`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBe('[InternalServerError]: Database error');
    });

    it('should return 404 when group is not found', async () => {
      jest.spyOn(GroupModel, 'findByIdAndUpdate').mockResolvedValue(undefined);

      const response = await supertest(app)
        .post(`/groups/toggle-join/${mockGroup._id}`)
        .send()
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe('[NotFoundError]: Group not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).post(`/groups/toggle-join/${mockGroup._id}`)
      .send().set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
