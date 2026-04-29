/**
 * Re-export of NextAuth handlers.
 * Kept separate so the catch-all route file is a single line.
 */
import { handlers } from "./config";

export const { GET, POST } = handlers;
