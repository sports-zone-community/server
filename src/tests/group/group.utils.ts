import { CreateGroupObject } from '../../validations';
import supertest from 'supertest';
import { app } from '../../app';

export const validMockGroup: CreateGroupObject = {
  name: 'Test Group',
  description: 'This is a test group',
  avatar: 'https://test-avatar-url',
};

export const invalidMockGroup: Partial<CreateGroupObject> = { name: validMockGroup.name };

export const testCreateGroup = async (createGroupObject: CreateGroupObject, accessToken: string) =>
  await supertest(app)
    .post('/groups')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(createGroupObject);

export const testJoinGroup = async (groupId: string, accessToken: string) =>
  await supertest(app)
    .post(`/groups/toggle-join/${groupId}`)
    .set('Authorization', `Bearer ${accessToken}`);
