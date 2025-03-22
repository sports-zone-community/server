import { chatRoutesDocs } from './routes/chat.docs';
import { footballRoutesDocs } from './routes/football.docs';
import { groupRoutesDocs } from './routes/group.docs';
import { authRoutesDocs } from './routes/auth.docs';
import { userRoutesDocs } from './routes/user.docs';
import { commentRoutesDocs } from './routes/comment.docs';

export const ROUTES_DOCS = {
  ...authRoutesDocs,
  ...chatRoutesDocs,
  ...commentRoutesDocs,
  ...userRoutesDocs,
  ...groupRoutesDocs,
  ...footballRoutesDocs,
};
