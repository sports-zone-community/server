import { chatRoutesDocs } from './routes/chat.docs';
import { footballRoutesDocs } from './routes/football.docs';
import { groupRoutesDocs } from './routes/group.docs';
import { authRoutesDocs } from './routes/auth.docs';
import { userRoutesDocs } from './routes/user.docs';
import { commentRoutesDocs } from './routes/comment.docs';
import { postRoutesDocs } from './routes/post.docs';
import { searchRoutesDocs } from './routes/search.docs';
import { adminRoutesDocs } from './routes/admin.docs';

export const ROUTES_DOCS = {
  ...adminRoutesDocs,
  ...authRoutesDocs,
  ...chatRoutesDocs,
  ...commentRoutesDocs,
  ...footballRoutesDocs,
  ...groupRoutesDocs,
  ...postRoutesDocs,
  ...searchRoutesDocs,
  ...userRoutesDocs,
};
