import { StatusCodes } from 'http-status-codes';
import {
  createAndLoginTestUser,
  otherValidMockRegister,
  validMockRegister,
} from '../auth/auth-test.utils';
import { testCreatePost, testGetExplorePosts, validMockPost } from './post-test.utils';
import { UserModel } from '../../models';
import { testToggleFollow } from '../user/user-test.utils';
import { testCreateGroup, testJoinGroup, validMockGroup } from '../group/group.utils';

describe('POST ROUTES - GET /posts/explore', () => {
  let user1: { userId: string; accessToken: string };
  let user2: { userId: string; accessToken: string };
  let groupId: any;

  beforeEach(async () => {
    user1 = await createAndLoginTestUser(validMockRegister);
    user2 = await createAndLoginTestUser(otherValidMockRegister);

    await testToggleFollow(user2.userId, user1.accessToken);

    const groupResponse = await testCreateGroup(validMockGroup, user2.accessToken);
    groupId = groupResponse.body._id;
    await testJoinGroup(groupId, user1.accessToken);
    await testCreatePost({ ...validMockPost, groupId }, user2.accessToken);

    await testCreatePost(validMockPost, user2.accessToken);
  });

  it('should return explore posts for the user', async () => {
    const response = await testGetExplorePosts(user1.accessToken, 1);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
  });

  it('should return an empty array if no posts are found', async () => {
    await testToggleFollow(user2.userId, user1.accessToken);
    await testJoinGroup(groupId, user1.accessToken);

    const response = await testGetExplorePosts(user1.accessToken, 1);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await testGetExplorePosts('invalid-token', 1);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Internal Server Error'));

    const response = await testGetExplorePosts(user1.accessToken, 1);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
