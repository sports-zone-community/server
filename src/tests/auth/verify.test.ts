import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../models';
import { verifyUser } from '../../controllers/auth.controller';

jest.mock('../../models/user.model');

describe('AUTH ROUTES - POST /auth/verify', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { user: { id: 'validUserId' } };
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  it('should return user data without password and tokens if user exists', async () => {
    const mockUser = {
      _id: 'validUserId',
      username: 'johndoe',
      email: 'john@example.com',
      fullName: 'John Doe',
    };

    const selectMock = jest.fn().mockResolvedValue(mockUser);
    (UserModel.findById as jest.Mock).mockReturnValue({ select: selectMock });

    await verifyUser(req as Request, res as Response);

    expect(UserModel.findById).toHaveBeenCalledWith('validUserId');
    expect(selectMock).toHaveBeenCalledWith('-password -tokens');
    expect(res.json).toHaveBeenCalledWith({ user: mockUser });
  });

  it('should return 401 if user is not found', async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    (UserModel.findById as jest.Mock).mockReturnValue({ select: selectMock });

    await verifyUser(req as Request, res as Response);

    expect(UserModel.findById).toHaveBeenCalledWith('validUserId');
    expect(selectMock).toHaveBeenCalledWith('-password -tokens');
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should handle errors and return 500 with error message', async () => {
    const errorMessage = 'Database error';
    (UserModel.findById as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await verifyUser(req as Request, res as Response);

    expect(UserModel.findById).toHaveBeenCalledWith('validUserId');
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
