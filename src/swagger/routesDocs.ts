import { chatRoutesDocs } from "./routes/chat.docs";
import { footballRoutesDocs } from "./routes/football.docs";
import { groupRoutesDocs } from "./routes/group.docs";

export const ROUTES_DOCS = {
  ...chatRoutesDocs,
  ...groupRoutesDocs,
  ...footballRoutesDocs
};