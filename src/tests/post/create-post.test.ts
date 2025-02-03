import { StatusCodes } from 'http-status-codes';
import { PostModel } from '../../models';
import { CreatePostObject } from '../../validations';
import { createTestPost, invalidMockPost, validMockPost } from './post-test.utils';
import { createTestGroup, validMockGroup } from '../group/group.utils';
import { fakeObjectId } from '../common-test.utils';
import {
  fakeAccessToken,
  testLogin,
  testRegister,
  validMockLogin,
  validMockRegister,
} from '../auth/auth-test.utils';
import { getObjectId } from '../../utils';

describe('POST ROUTES - POST /posts', () => {
  let accessToken: string;

  beforeEach(async () => {
    await testRegister(validMockRegister);
    const loginResponse = await testLogin(validMockLogin);
    accessToken = loginResponse.body.accessToken;
  });

  it('should create a regular new post', async () => {
    const response = await createTestPost(validMockPost, accessToken);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.image).toBe(validMockPost.image);
    expect(response.body.content).toBe(validMockPost.content);
  });

  it('should return a not found error if group ID does not exist', async () => {
    const mockPost: CreatePostObject = {
      ...validMockPost,
      groupId: getObjectId(fakeObjectId),
    };

    const response = await createTestPost(mockPost, accessToken);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should create a new post with valid group ID', async () => {
    const groupResponse = await createTestGroup(validMockGroup, accessToken);

    const groupId = groupResponse.body._id;
    const mockPost: CreatePostObject = { ...validMockPost, groupId };

    const response = await createTestPost(mockPost, accessToken);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.image).toBe(mockPost.image);
    expect(response.body.content).toBe(mockPost.content);
    expect(response.body.groupId).toBe(mockPost.groupId);
  });

  it('should return an error if a required field is missing', async () => {
    const response = await createTestPost(invalidMockPost, accessToken);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return an error if the user is not authenticated', async () => {
    const response = await createTestPost(validMockPost, fakeAccessToken);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 500 Internal Server Error on failure', async () => {
    jest.spyOn(PostModel, 'create').mockRejectedValue(new Error('Internal Server Error'));

    const response = await createTestPost(validMockPost, accessToken);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should return a bad request error if the user is not a member of the group', async () => {
    const otherUserMail: string = 'other-user@gmail.com';
    const otherUsername: string = 'other-username';
    await testRegister({ ...validMockRegister, email: otherUserMail, username: otherUsername });
    const otherUserAccessToken = (await testLogin({ ...validMockLogin, email: otherUserMail })).body
      .accessToken;
    const groupResponse = await createTestGroup(validMockGroup, otherUserAccessToken);

    const groupId = groupResponse.body._id;
    const mockPost: CreatePostObject = { ...validMockPost, groupId };

    const response = await createTestPost(mockPost, accessToken);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
