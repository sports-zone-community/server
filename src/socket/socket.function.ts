import { Socket } from 'socket.io';
import { verifyToken } from '../utils/auth.utils';
import { UnauthorizedError } from '../utils/errors';
import { UserModel } from '../models';
import { UserDocument } from '../models';
import { GroupDocument } from '../models';
import { GroupRepository } from '../repositories';

export const authenticateSocket = async (socket: Socket): Promise<string> => {
    const token: string = socket.handshake.auth.token;
    try {
        const { userId } = verifyToken(token);
        return userId;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

export const getUserId = (socket: Socket, authenticatedSockets: Map<string, string>): string => {
    const userId: string | undefined = authenticatedSockets.get(socket.id);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
}

export const handleError = (socket: Socket, error: Error) => {
    console.error('Socket error:', error);
    socket.emit('error', {
      message: error.message || 'Internal server error',
      code: error instanceof UnauthorizedError ? 'UNAUTHORIZED' : 'ERROR'
    });
}

export const joinUserRooms = async (socket: Socket, userId: string) => {
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